import React from 'react';

const HowItWorks = () => {
  return (
    <div id="methodology" className="max-w-7xl mx-auto px-margin-mobile lg:px-margin mt-space-2xl mb-space-2xl">
      <div className="text-center max-w-2xl mx-auto mb-space-xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black text-white font-label-sm text-xs uppercase tracking-widest mb-3 font-semibold shadow-sm">
          <span>Architecture Overview</span>
        </div>
        <h2 className="font-headline-lg text-3xl sm:text-4xl text-slate-900 font-serif font-medium">How the Engine Operates</h2>
        <p className="mt-space-sm font-body-md text-base text-slate-600 leading-relaxed">
          Moving past brittle keyword queries by synthesizing transformer sentiment decomposition with high-dimensional spatial indexing.
        </p>
      </div>

      {/* Triad Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter text-left">
        {/* Step 1 */}
        <div className="rounded-2xl bg-white p-space-xl border border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-lg hover:border-slate-200 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">chat_bubble_outline</span>
              </div>
              <span className="font-label-sm text-xs uppercase tracking-widest text-slate-400 font-bold">Stage 01</span>
            </div>
            <h3 className="mt-space-lg font-headline-sm text-xl text-slate-900 font-serif font-semibold">
              Natural Language Nuance
            </h3>
            <p className="mt-space-sm font-body-sm text-sm text-slate-600 leading-relaxed">
              Describe sensory textures, pace, or emotional undertones without catalog syntax. The natural language prompt is mapped into a dense 384-dimensional contextual vector representation.
            </p>
          </div>
          <div className="mt-space-lg pt-space-sm border-t border-slate-200">
            <a href="https://en.wikipedia.org/wiki/Attention_(machine_learning)" target="_blank" rel="noopener noreferrer" className="font-label-sm text-xs font-bold text-black flex items-center gap-1 group-hover:gap-2 transition-all hover:text-slate-600 cursor-pointer w-max">
              <span>Token Attention Heads</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </a>
          </div>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl bg-white p-space-xl border border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-lg hover:border-slate-200 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">psychology</span>
              </div>
              <span className="font-label-sm text-xs uppercase tracking-widest text-slate-400 font-bold">Stage 02</span>
            </div>
            <h3 className="mt-space-lg font-headline-sm text-xl text-slate-900 font-serif font-semibold">
              7-Vector Deconstruction
            </h3>
            <p className="mt-space-sm font-body-sm text-sm text-slate-600 leading-relaxed">
              Our MiniLM transformer model decomposes book synopses and queries across discrete affective coordinates: joy, sadness, fear, anger, surprise, disgust, and neutral atmosphere.
            </p>
          </div>
          <div className="mt-space-lg pt-space-sm border-t border-slate-200">
            <a href="https://en.wikipedia.org/wiki/Sentiment_analysis" target="_blank" rel="noopener noreferrer" className="font-label-sm text-xs font-bold text-black flex items-center gap-1 group-hover:gap-2 transition-all hover:text-slate-600 cursor-pointer w-max">
              <span>Emotion Weight Probabilities</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </a>
          </div>
        </div>

        {/* Step 3 */}
        <div className="rounded-2xl bg-white p-space-xl border border-slate-200/90 shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-lg hover:border-slate-200 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">hub</span>
              </div>
              <span className="font-label-sm text-xs uppercase tracking-widest text-slate-400 font-bold">Stage 03</span>
            </div>
            <h3 className="mt-space-lg font-headline-sm text-xl text-slate-900 font-serif font-semibold">
              Cosine Semantic Retrieval
            </h3>
            <p className="mt-space-sm font-body-sm text-sm text-slate-600 leading-relaxed">
              ChromaDB calculates the multi-dimensional cosine similarity between your emotional profile and our library corpus, fetching works that mirror your specified mood trajectory.
            </p>
          </div>
          <div className="mt-space-lg pt-space-sm border-t border-slate-200">
            <a href="https://en.wikipedia.org/wiki/Vector_database" target="_blank" rel="noopener noreferrer" className="font-label-sm text-xs font-bold text-black flex items-center gap-1 group-hover:gap-2 transition-all hover:text-slate-600 cursor-pointer w-max">
              <span>Sub-second Latent Search</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
      
      {/* BOTTOM STATS / TRUST BANNER */}
      <div className="mt-space-2xl rounded-2xl bg-white p-space-lg shadow-[0_4px_20px_rgba(15,23,42,0.04)] border border-slate-100 flex flex-wrap items-center justify-around gap-space-lg text-center">
        <div>
          <div className="font-headline-md text-3xl font-serif text-black font-semibold">Live</div>
          <div className="font-body-sm text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Google Books Sync</div>
        </div>
        <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
        <div>
          <div className="font-headline-md text-3xl font-serif text-black font-semibold">384 Dim</div>
          <div className="font-body-sm text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Embedding Resolution</div>
        </div>
        <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
        <div>
          <div className="font-headline-md text-3xl font-serif text-black font-semibold">Sub-sec</div>
          <div className="font-body-sm text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Vector Search</div>
        </div>
        <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
        <div>
          <div className="font-headline-md text-3xl font-serif text-black font-semibold">7 Emotions</div>
          <div className="font-body-sm text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1">Affective Spectrum</div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
