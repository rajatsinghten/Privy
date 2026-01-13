import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">
                    Privy
                </Link>
                <div className="space-x-4">
                    {/* TODO: Add navigation links */}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
