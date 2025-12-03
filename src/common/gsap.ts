import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import TextPlugin from 'gsap/TextPlugin'
import { Draggable } from 'gsap/Draggable'
import InertiaPlugin from 'gsap/InertiaPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP)
gsap.registerPlugin(TextPlugin)
gsap.registerPlugin(Draggable)
gsap.registerPlugin(InertiaPlugin)
gsap.registerPlugin(ScrollTrigger)

export default gsap
