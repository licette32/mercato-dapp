'use client'

import { useInitializeEscrow, useSendTransaction, useGetEscrowsFromIndexerBySigner } from '@trustless-work/escrow/hooks'
import type { InitializeMultiReleaseEscrowPayload } from '@trustless-work/escrow'
import { signTransaction } from '@/lib/trustless/wallet-kit'
import { usePollarSession } from '@/providers/pollar-provider'
import { USDC_TRUSTLINE } from '@/lib/trustless/trustlines'
import { MERCATO_PLATFORM_ADDRESS } from '@/lib/trustless/config'

interface DeployEscrowParams {
  dealId: string
  signerAddress: string
  supplierAddress: string
  productName: string
  description: string
  milestones: Array<{ title: string; amount: number }>
  provider: string | null
}

export function useCreateDealSubmit() {
  const { deployEscrow } = useInitializeEscrow()
  const { sendTransaction } = useSendTransaction()
  const { getEscrowsBySigner } = useGetEscrowsFromIndexerBySigner()
  const pollar = usePollarSession()

  const deployAndSignEscrow = async (
    params: DeployEscrowParams
  ): Promise<{ contractId: string | undefined }> => {
    const payload: InitializeMultiReleaseEscrowPayload = {
      signer: params.signerAddress,
      engagementId: params.dealId,
      title: params.productName,
      description: params.description,
      roles: {
        approver: params.signerAddress,
        serviceProvider: params.supplierAddress,
        platformAddress: MERCATO_PLATFORM_ADDRESS,
        releaseSigner: MERCATO_PLATFORM_ADDRESS,
        disputeResolver: MERCATO_PLATFORM_ADDRESS,
      },
      platformFee: 2.5,
      trustline: {
        address: USDC_TRUSTLINE.address,
        symbol: USDC_TRUSTLINE.symbol,
      },
      milestones: params.milestones.map((m) => ({
        description: m.title,
        amount: Math.round(m.amount * 100) / 100,
        receiver: params.supplierAddress,
      })),
    }

    const deployResponse = await deployEscrow(payload, 'multi-release')

    if (deployResponse.status !== 'SUCCESS' || !deployResponse.unsignedTransaction) {
      throw new Error('Failed to create escrow transaction')
    }

    let contractId: string | undefined

    if (params.provider === 'pollar') {
      await pollar.signAndSubmitTx(deployResponse.unsignedTransaction)

      const maxAttempts = 5
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 3000))
        }
        try {
          const escrows = await getEscrowsBySigner({ signer: params.signerAddress })
          const match = escrows.find((e) => e.engagementId === params.dealId)
          if (match?.contractId) {
            contractId = match.contractId
            break
          }
        } catch {
          // Indexer might not have caught up yet — retry
        }
      }
    } else {
      const signedXdr = await signTransaction({
        unsignedTransaction: deployResponse.unsignedTransaction,
        address: params.signerAddress,
      })

      if (!signedXdr) {
        throw new Error('Failed to sign transaction')
      }

      const txResult = await sendTransaction(signedXdr)

      if (txResult.status !== 'SUCCESS') {
        throw new Error(
          'message' in txResult
            ? (txResult as { message: string }).message
            : 'Transaction submission failed'
        )
      }

      const escrowResponse = txResult as {
        contractId?: string
        escrow?: { contractId?: string }
      }
      contractId = escrowResponse.contractId ?? escrowResponse.escrow?.contractId
    }

    return { contractId }
  }

  return { deployAndSignEscrow }
}
