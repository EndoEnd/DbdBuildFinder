import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#ef444420_1px,transparent_1px)] bg-[length:50px_50px]"></div>
      
      <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <h1 className="title-font text-7xl md:text-[5.5rem] font-black tracking-[-4px] mb-6 ghost-glow">
            STALK<span className="text-[#ef4444]">LAB</span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-400 mb-10 max-w-3xl mx-auto leading-tight">
            ゴーストフェイスが、ゴーストフェイスのために作った<br />
            <span className="text-red-400 font-medium">究極のステルス戦略ラボ</span>
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
          <Link
            to="/builds"
            className="group relative px-14 py-7 bg-red-600 hover:bg-red-700 text-2xl font-bold rounded-3xl overflow-hidden transition-all hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">最強ビルドを見る</span>
          </Link>
          <Link
            to="/maps"
            className="px-14 py-7 border-2 border-red-500/70 hover:border-red-400 text-2xl font-medium rounded-3xl transition-all hover:bg-red-950/40"
          >
            マップ攻略へ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
