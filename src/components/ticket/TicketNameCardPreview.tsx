'use client'

import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import S3Image from '@/components/common/S3Image'

type TicketNameCardPreviewProps = {
	tierCodeNumber: number
	avatarUrl?: string | null
	displayName: string
	previewName: string
	referenceCode?: string | null
}

const clamp = (n: number, min: number, max: number) =>
	Math.max(min, Math.min(max, n))

const TIER_TEMPLATE_SRC: Record<number, string> = {
	// T1 is present in assets, but name-card editing requires tier >= T2.
	1: '/images/ticket/thestandard.png',
	2: '/images/ticket/thesponsor.png',
	3: '/images/ticket/thesupersponsor.png',
	4: '/images/ticket/thevip.png',
	5: '/images/ticket/thegoh.png',
}

const TicketNameCardPreview = forwardRef<
	HTMLDivElement,
	TicketNameCardPreviewProps
>(
	(
		{ tierCodeNumber, avatarUrl, displayName, previewName, referenceCode },
		ref
	) => {
		const [previewNameScale, setPreviewNameScale] = useState(1)
		const previewNameContainerRef = useRef<HTMLDivElement>(null)
		const previewNameTextRef = useRef<HTMLDivElement>(null)

		const referenceLabel = useMemo(() => {
			return referenceCode ? `#${referenceCode}` : ''
		}, [referenceCode])

		const templateSrc = useMemo(() => {
			const safeTier = clamp(tierCodeNumber || 1, 1, 5)
			return TIER_TEMPLATE_SRC[safeTier] ?? TIER_TEMPLATE_SRC[1]
		}, [tierCodeNumber])

		const previewNameFontSize = useMemo(() => {
			const normalized = (previewName || '').trim().replace(/\s+/g, ' ')
			const words = normalized ? normalized.split(' ').length : 0
			const len = normalized.length

			// Tune thresholds to keep short names punchy, long names readable.
			if (len > 15 || words >= 5) return 'clamp(16px, 3.8vw, 36px)'
			if (len > 10 || words >= 4) return 'clamp(22px, 4.3vw, 42px)'
			return 'clamp(22px, 5.2vw, 50px)'
		}, [previewName])

		useEffect(() => {
			const el = previewNameContainerRef.current
			const textEl = previewNameTextRef.current
			if (!el || !textEl) return

			const measure = () => {
				// `scrollWidth` isn't affected by CSS transforms, so this stays correct
				// even after we've applied a scale.
				const available = el.getBoundingClientRect().width
				const needed = textEl.scrollWidth
				if (!available || !needed) return
				const scale = Math.max(0.01, Math.min(1, available / needed))
				setPreviewNameScale(scale)
			}

			// Measure now and once more on the next frame to catch late layout changes.
			measure()
			requestAnimationFrame(() => measure())

			const ro = new ResizeObserver(() => measure())
			ro.observe(el)

			const fontsReady: Promise<unknown> | undefined =
				'fonts' in document ? document.fonts.ready : undefined
			fontsReady?.then(() => measure())

			return () => ro.disconnect()
		}, [previewName, templateSrc, referenceLabel])

		return (
			<div
				ref={ref}
				className='relative w-full max-w-[420px] mx-auto'
				// Prevent drag ghost images on template.
				draggable={false}
			>
				{/* Avatar goes UNDER the badge PNG (PNG transparency will reveal it) */}
				<div
					className='absolute overflow-hidden rounded-[10px]'
					style={{
						left: '15.5%',
						top: '29%',
						width: '53%',
						height: '35%',
					}}
				>
					<div className='relative w-40 h-50 bg-white'>
						{avatarUrl ? (
							<S3Image
								src={avatarUrl}
								alt={displayName}
								fill
								className='object-cover'
							/>
						) : (
							<div className='w-full h-full flex items-center justify-center text-white/60 text-3xl font-bold'>
								{(displayName || 'U').slice(0, 1).toUpperCase()}
							</div>
						)}
					</div>
				</div>

				{/* Badge artwork on TOP */}
				<Image
					src={templateSrc}
					alt='Name card preview template'
					width={652}
					height={1001}
					className='relative w-full h-auto rounded-xl z-10'
					priority={false}
				/>

				{/* Name + reference overlay on the badge */}
				<div
					className='absolute z-20 text-left'
					style={{
						left: '12%',
						top: '73.5%',
					}}
				>
					<div
						className='mb-3 font-semibold uppercase tracking-[0.22em]'
						style={{
							color: 'rgba(15, 35, 40, 0.75)',
							fontSize: 'clamp(10px, 1.6vw, 14px)',
							lineHeight: 1,
							textShadow: '0 1px 2px rgba(255,255,255,0.35)',
							fontFamily: '"Comic Sans MS","Comic Sans",cursive',
						}}
					>
						{referenceLabel}
					</div>

					<div
						ref={previewNameContainerRef}
						className='font-extrabold uppercase w-[210px] overflow-hidden'
						style={{
							color: 'rgba(245, 240, 230, 0.95)',
							fontSize: previewNameFontSize,
							lineHeight: 1.05,
							whiteSpace: 'nowrap',
						}}
					>
						<div
							ref={previewNameTextRef}
							style={{
								display: 'inline-block',
								transform: `scale(${previewNameScale})`,
								transformOrigin: 'left center',
							}}
						>
							{previewName}
						</div>
					</div>
				</div>
			</div>
		)
	}
)

TicketNameCardPreview.displayName = 'TicketNameCardPreview'

export default TicketNameCardPreview
