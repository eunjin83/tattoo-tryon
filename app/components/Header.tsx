export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        <h1 className="text-3xl font-bold tracking-wider text-white">
          ZK TATTOO
        </h1>

        <nav>
          <ul className="flex gap-10 text-lg text-zinc-300">
            <li className="cursor-pointer transition hover:text-white">
              Home
            </li>

            <li className="cursor-pointer transition hover:text-white">
              Try-On
            </li>

            <li className="cursor-pointer transition hover:text-white">
              Portfolio
            </li>

            <li className="cursor-pointer transition hover:text-white">
              Booking
            </li>

            <li className="cursor-pointer transition hover:text-white">
              Contact
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}