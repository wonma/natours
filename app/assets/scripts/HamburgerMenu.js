const navBG = document.querySelector('.navigation__background')
const navCheckbox = document.querySelector('.navigation__checkbox')
const navLinks = document.querySelectorAll('.navigation__link')

navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
        navBG.style.transform = 'scale(1)'
        navCheckbox.checked = !navCheckbox.checked;
    })
})

navCheckbox.addEventListener('click', (e) => {
    if(e.target.checked) {
        navBG.style.transform = 'scale(100)'
    } else {
        navBG.style.transform = 'scale(1)'
    }
})