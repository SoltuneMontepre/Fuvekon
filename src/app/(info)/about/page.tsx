import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const AboutPage = (): React.ReactElement => {
	const t = useTranslations('about')

	const heroImage = '/images/about/_DSC3836-Enhanced-NR.jpg'
	const galleryImages = [
		'/images/about/_DSC3598.jpg',
		'/images/about/_DSC3614.jpg',
		'/images/about/Screenshot%202026-02-05%20150326.png',
		'/images/about/TUS09176.jpg',
		'/images/about/Screenshot%202026-02-05%20150429.png',
	]

	return (
		<div className='relative z-10 min-h-screen bg-[#0e2b23] text-white -mt-14 pt-24 pb-24'>
			<div className='max-w-6xl mx-auto px-4 lg:px-8 space-y-16'>
				{/* Hero / intro */}
				<section className='grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] items-start'>
					<div className='relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-black/60 border border-white/10 shadow-xl'>
						<Image
							src={heroImage}
							alt={t('hero.title')}
							fill
							className='object-cover'
							sizes='(min-width: 1024px) 480px, 100vw'
							priority
						/>
					</div>

					<div className='space-y-4'>
						<h1 className='text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight'>
							{t('hero.title')}
						</h1>
						<p className='text-md leading-relaxed text-white/80'>
							{t('hero.paragraph1')}
						</p>
						<p className='text-md leading-relaxed text-white/80'>
							{t('hero.paragraph2')}
						</p>
						<p className='text-md leading-relaxed text-white/80'>
							{t('hero.paragraph3')}
						</p>
					</div>
				</section>

				{/* Video + recap card */}
				<section className='grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-stretch'>
					<div className='rounded-3xl bg-[#050b10] border border-white/10 shadow-2xl shadow-black/50 p-4 md:p-6 flex items-center justify-center'>
						<div className='relative w-full aspect-video rounded-2xl overflow-hidden border border-white/20 shadow-lg'>
							<iframe
								className='w-full h-full'
								src='https://www.youtube.com/embed/r8w5ICehR2U'
								title='YouTube video player'
								allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
								referrerPolicy='strict-origin-when-cross-origin'
								allowFullScreen
							/>
						</div>
					</div>

					<div className='rounded-3xl bg-[#e2eee2] text-[#154c5b] border border-[#f3f7f3] shadow-xl px-6 py-8 md:px-8 md:py-10'>
						<h2 className='text-lg md:text-xl font-semibold tracking-wide mb-2'>
							{t('recap.title')}
						</h2>
						<p className='text-lg leading-relaxed mb-6'>
							{t('recap.description')}
						</p>
						<button className='inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold bg-[#48715b] text-white shadow-sm hover:bg-[#2f5140] transition-colors'>
							{t('recap.button')}
						</button>
					</div>
				</section>

				{/* Gallery / placeholders */}
				<section className='space-y-4'>
					<h2 className='text-xl md:text-2xl font-semibold tracking-wide'>
						{t('activities.title')}
					</h2>
					<div className='grid gap-4 md:gap-6 md:grid-cols-3'>
						{galleryImages.map((src, index) => (
							<div
								key={src}
								className={`relative overflow-hidden rounded-2xl bg-gray-200/80 ${
									index === 3 ? 'md:col-span-2 aspect-[16/9]' : 'aspect-[4/3]'
								}`}
							>
								<Image
									src={src}
									alt={`${t('activities.title')} ${index + 1}`}
									fill
									className='object-cover'
									sizes='(min-width: 1024px) 400px, 100vw'
								/>
							</div>
						))}
					</div>
				</section>

				{/* Credits */}
				<section className='space-y-6 border-t border-white/10 pt-10'>
					<h2 className='text-xs tracking-[0.25em] uppercase text-white/60'>
						{t('credits.title')}
					</h2>

					<div className='grid gap-8 md:grid-cols-2'>
						<div className='space-y-2'>
							<h3 className='text-sm font-semibold uppercase tracking-wide text-white/80'>
								{t('credits.staff.title')}
							</h3>
							<p className='text-base leading-relaxed text-white/70'>
								Mỏng, Alasky, Archie, Peachy, Frank, Zuron, Fynn, Kosmas, Yakus,
								Louis, Haru, Matsu, Shu, Fumi, Ẽist, Kazeous, Kiều Dung, Nick,
								Null, Harry, Shamanu, Shizuhiro, Flotsams, Méng
							</p>
						</div>

						<div className='space-y-2'>
							<h3 className='text-sm font-semibold uppercase tracking-wide text-white/80'>
								{t('credits.dev.title')}
							</h3>
							<p className='text-base leading-relaxed text-white/70'>
								Bintuc — {t('credits.dev.lead')}, Hatohui, JackWh, Kiệt, Makiato
							</p>
						</div>
					</div>

					<div className='grid gap-8 md:grid-cols-2'>
						<div className='space-y-2'>
							<h3 className='text-sm font-semibold uppercase tracking-wide text-white/80'>
								{t('credits.design.title')}
							</h3>
							<p className='text-base leading-relaxed text-white/70'>
								Sugi, Alasky
							</p>
						</div>

						<div className='space-y-2'>
							<h3 className='text-sm font-semibold uppercase tracking-wide text-white/80'>
								{t('credits.sponsor.title')}
							</h3>
							<p className='text-base leading-relaxed text-white/70'>
								Funky Furs Club
							</p>
						</div>
					</div>

					<div className='space-y-2'>
						<h3 className='text-sm font-semibold uppercase tracking-wide text-white/80'>
							{t('credits.banner.title')}
						</h3>
						<p className='text-base leading-relaxed text-white/70'>
							Danh Nguyễn
						</p>
					</div>
				</section>
			</div>
		</div>
	)
}

export default AboutPage
