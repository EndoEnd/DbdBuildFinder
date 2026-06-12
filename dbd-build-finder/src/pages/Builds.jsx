import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gameData from '../gameData.js';

const Builds = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBuilds = gameData.builds.filter(build =>
    build.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    build.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="mb-12">
        <h1 className="title-font text-5xl font-bold mb-4">Ghost Face 最強ビルド</h1>
        <p className="text-gray-400 text-xl">ステルスとチェイスを極める専用構成</p>
      </div>

      <div className="mb-10">
        <input
          type="text"
          placeholder="ビルド名やパークで検索..."
          className="w-full bg-zinc-950 border border-zinc-700 focus:border-red-500 rounded-2xl px-8 py-5 text-lg focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredBuilds.map((build, index) => (
            <motion.div
              key={index}
              className="card-hover bg-[#111] border border-zinc-800 rounded-3xl p-8 flex flex-col h-full"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -12 }}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold title-font">{build.name}</h3>
                  <p className="text-red-500 font-mono">TIER {build.tier}</p>
                </div>
                <div className="text-6xl opacity-75">👻</div>
              </div>

              <p className="text-gray-400 mb-8 flex-1 leading-relaxed">{build.description}</p>

              <div className="mt-auto">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">パーク構成</p>
                <div className="flex flex-wrap gap-3">
                  {build.perks.map((perk, i) => (
                    <div key={i} className="bg-black px-5 py-3 rounded-2xl text-sm border border-zinc-700 flex items-center gap-3">
                      <span className="text-red-400">🩸</span>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Builds;
