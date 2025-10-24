export default function Footer() {
	const year = new Date().getFullYear()
	return (
		<footer className="footer">
			<div className="footer-inner">
				<div className="footer-brand">
					<div className="logo small" aria-hidden="true">
						<a href="/">
							<img src={new URL('../assets/logo_no_image.svg', import.meta.url).toString()} width={40} height={35}
									 alt="Moveasy logo"/>
						</a>
					</div>
				</div>
				<nav className="footer-links" aria-label="Linki w stopce">
					<a href="#">O nas</a>
					<a href="#">Kontakt</a>
					<a href="#">Polityka prywatności</a>
					<a href="#">Regulamin</a>
				</nav>
				<div className="footer-copy">© {year} Moveasy. Wszelkie prawa zastrzeżone.</div>
			</div>
		</footer>
	)
}
