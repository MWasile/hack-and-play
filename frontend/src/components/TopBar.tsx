import logo from '../assets/logo.svg';

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <div className="logo" aria-hidden="true">
            <img src={logo} width={70} height={70} alt="Moveasy logo" />
          </div>
        </div>
      </div>
    </header>
  )
}
