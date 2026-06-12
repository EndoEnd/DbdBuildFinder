import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/builds', label: 'ビルド' },
    { path: '/maps', label: 'マップ' },
    { path: '/perks', label: 'パーク' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-black/95 border-b border-red-900/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
          <motion.div 
            className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-5xl border border-red-500/30 ghost-mask"
            whileHover={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 0.6 }}
          >
            👻
          </motion.div>
          <div>
            <h1 className="title-font text-4xl font-bold tracking-tighter text-white group-hover:text-red-400 transition-colors">
              STALK<span className="text-[#ef4444]">LAB</span>
            </h1>
            <p className="text-xs text-gray-500 -mt-1">GHOST FACE STRATEGY LAB</p>
          </div>
        </Link>

        <nav className="flex gap-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-7 py-3 rounded-2xl font-medium transition-all hover:bg-zinc-900 ${location.pathname === item.path ? 'bg-red-950 text-red-400 border border-red-800' : 'text-gray-400 hover:text-white'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
