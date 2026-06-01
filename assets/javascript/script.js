/*--------------------------- Page Loader --------------------------------*/
$(function () {
    setTimeout(() => {
        $('.page-loader').fadeOut('slow');
    }, 500);
});

/*----------------------------- Menu Header --------------------*/
(function () {
    "use strict";
    document.addEventListener("DOMContentLoaded", function () {
        const menuBtn = document.getElementById("menuBtn");
        const menuOverlay = document.getElementById("menuOverlay");
        const closeBtn = document.getElementById("closeBtn");
        const menuLinks = document.querySelectorAll(".menu-content a");

        // Toggle Menu
        const toggleMenu = (state) => {
            if (!menuOverlay) return;

            menuOverlay.classList[state ? "add" : "remove"]("active");
            document.body.classList[state ? "add" : "remove"]("no-scroll");
        };

        // OPEN MENU
        menuBtn?.addEventListener("click", () => toggleMenu(true));

        // CLOSE BUTTON
        closeBtn?.addEventListener("click", () => toggleMenu(false));

        // MENU LINKS
        menuLinks.forEach(link => {
            link.addEventListener("click", function (e) {

                const targetId = this.getAttribute("href");

                if (targetId?.startsWith("#")) {
                    e.preventDefault();
                    document.querySelector(targetId)?.scrollIntoView({
                        behavior: "smooth"
                    });
                }

                toggleMenu(false);
            });
        });
    });
})();

/*----------------------------- Dark/ Light Mode Toggle --------------------*/
function myFunction() {
    var element = document.body;
    element.classList.toggle("dark-mode");

    var sunIcon = document.getElementById("sunIcon");
    var moonIcon = document.getElementById("moonIcon");

    if (element.classList.contains("dark-mode")) {
        sunIcon.classList.add("hidden");
        moonIcon.classList.remove("hidden");
        localStorage.setItem("mode", "dark");
    } else {
        moonIcon.classList.add("hidden");
        sunIcon.classList.remove("hidden");
        localStorage.setItem("mode", "light");
    }
}
document.addEventListener("DOMContentLoaded", function () {
    const toggleBtn = document.getElementById("themeToggle");
    toggleBtn.addEventListener("click", myFunction);
    const storedMode = localStorage.getItem("mode");

    if (storedMode === "dark") {
        document.body.classList.add("dark-mode");
        var sunIcon = document.getElementById("sunIcon");
        var moonIcon = document.getElementById("moonIcon");
        sunIcon.classList.add("hidden");
        moonIcon.classList.remove("hidden");
    }
});

/*----------------------- Whole Page Scrolling Animation -----------------------------*/
const observer3 = new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting, target }) => {
        target.classList.toggle('show', isIntersecting);
    });
});

const hiddenElements = document.querySelectorAll('.fade_up, .fade_down, .zoom_in, .zoom_out, .fade_right, .fade_left, .flip_left, .flip_right, .flip_up, .flip_down');

document.addEventListener('DOMContentLoaded', () => {
    hiddenElements.forEach((el) => observer3.observe(el));
});

/*------------------------------------- Scroll counter -------------------------------------*/
var counted = 0;
$(window).on('scroll', function () {
    var oTop = $('.counter').offset()?.top - window.innerHeight;
    if (counted === 0 && $(window).scrollTop() > oTop) {
        $('.count').each(function () {
            var $this = $(this),
                countTo = $this.attr('data-count');
            $({
                countNum: $this.text()
            }).animate({
                countNum: countTo
            },
                {
                    duration: 800,
                    easing: 'swing',
                    step: function () {
                        $this.text(Math.floor(this.countNum));
                    },
                    complete: function () {
                        $this.text(this.countNum);
                    }
                });
        });
        counted = 1;
    }
});

/*------------------------------------- Testimonila Slider -------------------------------------*/
$(document).ready(function () {
    const $slider = $('.container-slider');
    $slider.slick({
        infinite: true,
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: true,
        arrows: true,
        dots: false,
        speed: 1000,
        prevArrow: '<button type="button" class="single-slick-arrow slick-prev"><img src="assets/images/svg/left-arrow.svg" alt="left-arrow"></button>',
        nextArrow: '<button type="button" class="single-slick-arrow slick-next"><img src="assets/images/svg/right-arrow.svg" alt="right-arrow"></button>',
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 2,
                    arrows: false
                }
            },
            {
                breakpoint: 660,
                settings: {
                    slidesToShow: 1,
                    arrows: false
                }
            }
        ]
    });

    function setEqualHeight() {
        let maxHeight = 0;
        $('.testimonila-box').css('height', 'auto');
        $('.testimonila-box').each(function () {
            maxHeight = Math.max(maxHeight, $(this).outerHeight());
        });
        $('.testimonila-box').css('height', maxHeight);
    }

    setEqualHeight();
    $slider.on('setPosition', setEqualHeight);
    $(window).on('resize', function () {
        setEqualHeight();
    });
});

/*------------------------------------- Pricing Form -------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("planModal");
    const planName = document.getElementById("planName");
    const planPrice = document.getElementById("planPrice");

    document.querySelectorAll(".pricing-button").forEach(btn => {
        btn.addEventListener("click", () => {
            if (planName) planName.value = btn.dataset.plan || "";
            if (planPrice) planPrice.value = btn.dataset.price || "";
            modal?.classList.add("active");
        });
    });

    document.querySelector(".close-modal")?.addEventListener("click", () => {
        modal?.classList.remove("active");
    });

    modal?.addEventListener("click", e => {
        if (e.target === modal) modal.classList.remove("active");
    });
});