import { throttle } from "./libs/utils";
import "./polyfills.js";
import "./blocks.js";

import Swiper from "swiper";
import { Autoplay, EffectFade } from "swiper/modules";

class Accordions {
	constructor(selector = '.accordeons', options = {}) {
		this.containers = document.querySelectorAll(selector);

		this.options = {
			closeOthers: false, // только один открыт
			allowClose: true,  // можно ли закрывать активный
			onClick: null,
			onOpen: null,
			onClose: null,
			...options
		};

		this.init();
	}

	init() {
		this.containers.forEach(container => {
			this.initContainer(container);
		});
	}

	initContainer(container) {
		const items = container.querySelectorAll('.accordeons__item');

		items.forEach(item => {
			const head = item.querySelector('.accordeons__item-head');

			if (!head) return;

			head.addEventListener('click', () => {
				const isActive = item.classList.contains('active');

				this.options.onClick?.(item, container);

				if (isActive) {
					if (this.options.allowClose) {
						this.close(item);
					}
					return;
				}

				if (this.options.closeOthers) {
					items.forEach(otherItem => {
						if (otherItem !== item) {
							this.close(otherItem);
						}
					});
				}

				this.open(item);
			});
		});
	}

	open(item) {
		if (item.classList.contains('active')) return;

		item.classList.add('active');
		this.options.onOpen?.(item);
	}

	close(item) {
		if (!item.classList.contains('active')) return;

		item.classList.remove('active');
		this.options.onClose?.(item);
	}
}

// Функции
const setScrollbarWidth = () => {
	document.documentElement.style.setProperty('--sw', `${window.innerWidth - document.documentElement.clientWidth}px`);
}

const setSwipers = () => {
	const heroSwiper = new Swiper('.hero__bg.swiper', {
		modules: [Autoplay, EffectFade],
		slidesPerView: 1,
		loop: true,
		effect: 'fade',
		fadeEffect: {
			crossFade: true
		},
		autoplay: {
			delay: 5000
		}
	})
}

const setHeader = () => {
	const header = document.querySelector('.header');
	if (!header) return;

	const burger = header.querySelector('.header__burger');
	const menu = header.querySelector('.header__menu');
	const menuContent = menu.querySelector('.header__menu-content');
	const menuClose = menu.querySelector('.header__menu-close');

	const headerBlock = document.querySelector('[data-header-block]');

	const openMenu = () => {
		menu.classList.add('active');
		document.body.classList.add('scroll-lock');
	};

	const closeMenu = () => {
		menu.classList.remove('active');
		document.body.classList.remove('scroll-lock');
	};

	const toggleMenu = () => {
		menu.classList.contains('active') ? closeMenu() : openMenu();
	};

	const handleHeaderScroll = () => {
		if (!headerBlock) {
			header.classList.add('header_scroll');
			return;
		}

		const triggerPoint =
			headerBlock.offsetTop +
			headerBlock.offsetHeight -
			header.offsetHeight;

		if (window.scrollY > triggerPoint) {
			header.classList.add('header_scroll');
		} else {
			header.classList.remove('header_scroll');
		}
	};

	burger.addEventListener('click', toggleMenu);
	menuClose.addEventListener('click', closeMenu);

	menu.addEventListener('click', closeMenu);

	menuContent.addEventListener('click', (e) => {
		e.stopPropagation();
	});

	handleHeaderScroll();
	window.addEventListener('scroll', handleHeaderScroll);
};

const setAdvantagesCounter = () => {
	const items = document.querySelectorAll('.advantages__item-value span');

	if (!items.length) return;

	const animateValue = (element) => {
		const target = parseInt(element.textContent.trim(), 10);
		const duration = 1800;
		const startTime = performance.now();

		const updateCounter = (currentTime) => {
			const progress = Math.min((currentTime - startTime) / duration, 1);
			const value = Math.floor(progress * target);

			element.textContent = value;

			if (progress < 1) {
				requestAnimationFrame(updateCounter);
			} else {
				element.textContent = target;
			}
		};

		requestAnimationFrame(updateCounter);
	};

	const observer = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;

			animateValue(entry.target);
			observer.unobserve(entry.target);
		});
	}, {
		threshold: 0.4
	});

	items.forEach(item => observer.observe(item));
};

const setDirectionsAccordeons = () => {
	const directionsSection = document.querySelector('.directions');
	if(!directionsSection) return;

	const images = [...directionsSection.querySelectorAll('.directions__image')];

	new Accordions('.directions__accordeons', {
		closeOthers: true,
		allowClose: false,

		onClick: (item) => {
			console.log('clicked', item);
		},

		onOpen: (item) => {
			const allItems = [...item.parentElement.querySelectorAll('.accordeons__item')];
			const index = allItems.indexOf(item);

			images.forEach(image => image.classList.remove('active'));
			images[index]?.classList.add('active');
		},

		onClose: (item) => {
			console.log('closed', item);
		}
	});
}

// Запуск функций
window.addEventListener("load", () => {
	setScrollbarWidth();
	setSwipers();
	setHeader();
	setAdvantagesCounter();
	setDirectionsAccordeons();
})