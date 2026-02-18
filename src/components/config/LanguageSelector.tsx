'use client'

import { Language, SUPPORTED_LANGS } from '@/common/language'
import useLanguage from '@/hooks/config/useLanguage'
import React, { useEffect, useRef, useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'

interface LanguageSelectorProps {
	className?: string
}

const LanguageSelector = ({ className }: LanguageSelectorProps) => {
	const { locale, changeLanguage } = useLanguage()
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const handleSelect = (lang: Language) => {
		changeLanguage(lang)
		setIsOpen(false)
	}

	// Language labels with flags
	const languageLabels: Record<Language, string> = {
		en: '🇬🇧 EN',
		zh: '🇨🇳 中文',
		th: '🇹🇭 ไทย',
		vi: '🇻🇳 Tiếng Việt',
	}

	return (
		<div
			className={`relative inline-block ${className ?? ''}`}
			ref={dropdownRef}
		>
			<button
				type='button'
				id='language-selector'
				aria-label='Select language'
				aria-haspopup='listbox'
				aria-expanded={isOpen}
				onClick={() => setIsOpen(v => !v)}
				className='text-white  appearance-none cursor-pointer bg-transparent px-1.5 sm:px-2 py-1 sm:py-1.5 pr-5 sm:pr-6 text-xs sm:text-sm font-medium rounded-md hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-main'
			>
				<span>{languageLabels[locale]}</span>
				<span className='absolute inset-y-0 right-0 flex items-center pr-1.5 sm:pr-2 pointer-events-none'>
					<FiChevronDown
						className='w-3 h-3 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500'
						aria-hidden
					/>
				</span>
			</button>

			{isOpen && (
				<ul
					role='listbox'
					aria-label='Select language'
					className='absolute right-0 top-full mt-2 min-w-[10rem] rounded-lg shadow-lg z-50 border border-white/10 backdrop-blur text-slate-100 overflow-hidden'
				>
					{SUPPORTED_LANGS.map(lang => (
						<li key={lang} role='option' aria-selected={locale === lang}>
							<button
								type='button'
								onClick={() => handleSelect(lang)}
								className={`w-full text-left px-3 py-2 text-sm transition-colors ${
									locale === lang ? 'bg-white/10' : 'hover:bg-white/10'
								}`}
							>
								{languageLabels[lang]}
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

export default LanguageSelector
