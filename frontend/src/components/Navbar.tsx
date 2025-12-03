import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">
          Sistema de Biblioteca
        </Link>
        <div className="space-x-4">
          <Link href="/livros" className="text-gray-300 hover:text-white">
            Livros
          </Link>
          <Link href="/emprestimos" className="text-gray-300 hover:text-white">
            Empréstimos
          </Link>
          <Link href="/reservas" className="text-gray-300 hover:text-white">
            Reservas
          </Link>
           <Link href="/" className="text-gray-300 hover:text-white">
            Sair
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
