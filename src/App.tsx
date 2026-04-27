/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Tag as TagIcon, 
  X, 
  Hash, 
  Clock,
  LayoutGrid,
  Menu,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Note = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

const STORAGE_KEY = "mymemo.notes";

const INITIAL_NOTES: Note[] = [
  {
    id: 1,
    title: "시안 작업 가이드",
    body: "브랜드 아이덴티티를 유지하기 위한 디자인 가이드라인입니다. 폰트는 Inter를 사용하며, 기본 색상은 #3B82F6입니다.",
    tags: ["디자인", "가이드"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "읽어야 할 책 리스트",
    body: "1. 클린 코드\n2. 디자인 패턴의 정석\n3. 실용주의 프로그래머",
    tags: ["독서", "자기개발"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "프로젝트 아이디어",
    body: "포트폴리오용 풀스택 웹앱 기획. React와 Firebase를 연동한 실시간 협업 도구 개발하기.",
    tags: ["업무", "개발"],
    updatedAt: new Date().toISOString(),
  },
];

export default function App() {
  // --- State ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formTags, setFormTags] = useState("");

  // --- Effects ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        setNotes(INITIAL_NOTES);
      }
    } else {
      setNotes(INITIAL_NOTES);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // --- Derived State ---
  const allTagsMap = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [notes]);

  const uniqueTags = Object.keys(allTagsMap).sort();

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true;
      
      return matchesSearch && matchesTag;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, searchQuery, selectedTag]);

  // --- Handlers ---
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newNote: Note = {
      id: Date.now(),
      title: formTitle,
      body: formBody,
      tags: formTags.split(',').map(t => t.trim()).filter(t => t !== ""),
      updatedAt: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]);
    closeModal();
  };

  const deleteNote = (id: number) => {
    if (window.confirm("이 메모를 삭제하시겠습니까?")) {
      setNotes(notes.filter(n => n.id !== id));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormTitle("");
    setFormBody("");
    setFormTags("");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
      {/* --- Header --- */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
            id="sidebar-toggle"
          >
            <Menu className="w-5 h-5 text-slate-500" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">MyMemo</h1>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="제목, 내용, 태그 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
              id="search-input"
            />
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-200"
          id="add-note-btn"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">새 메모</span>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* --- Sidebar --- */}
        <aside 
          className={`
            fixed lg:relative z-20 h-full w-64 bg-white border-r border-slate-200 transition-transform duration-300
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}
          `}
          id="sidebar"
        >
          <div className="p-4 flex flex-col h-full">
            <div className="mb-6">
              <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ${!isSidebarOpen && 'lg:hidden'}`}>
                Filters
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all
                    ${selectedTag === null ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}
                  `}
                >
                  <LayoutGrid className="w-4 h-4 shrink-0" />
                  <span className={`${!isSidebarOpen && 'lg:hidden'} flex-1 text-left`}>전체</span>
                  <span className={`text-xs opacity-60 ${!isSidebarOpen && 'lg:hidden'}`}>{notes.length}</span>
                </button>
              </nav>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ${!isSidebarOpen && 'lg:hidden'}`}>
                Tags
              </p>
              <nav className="space-y-1">
                {uniqueTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all
                      ${selectedTag === tag ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'}
                    `}
                  >
                    <Hash className="w-4 h-4 shrink-0" />
                    <span className={`${!isSidebarOpen && 'lg:hidden'} flex-1 text-left truncate`}>{tag}</span>
                    <span className={`text-xs opacity-60 ${!isSidebarOpen && 'lg:hidden'}`}>{allTagsMap[tag]}</span>
                  </button>
                ))}
              </nav>
            </div>
            
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex items-center justify-center p-2 mt-4 hover:bg-slate-100 rounded-xl text-slate-400 self-center transition-transform"
              style={{ transform: !isSidebarOpen ? 'rotate(180deg)' : 'none' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* --- Main Area --- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 relative">
          {/* Mobile Search Bar (only visible on small screens) */}
          <div className="mb-6 sm:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="메모 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-6 max-w-6xl mx-auto">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedTag ? `#${selectedTag}` : "전체 메모"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  총 {filteredNotes.length}개의 메모가 있습니다.
                </p>
              </div>
            </header>

            {filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
                <AnimatePresence mode="popLayout">
                  {filteredNotes.map(note => (
                    <motion.article
                      key={note.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -4 }}
                      className="group bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all relative flex flex-col h-full"
                      id={`note-${note.id}`}
                    >
                      <button 
                        onClick={() => deleteNote(note.id)}
                        className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1.5 text-slate-400 mb-3">
                        <Clock className="w-3.5 h-3.5" />
                        <time className="text-[10px] font-medium leading-none">
                          {formatDate(note.updatedAt)}
                        </time>
                      </div>

                      <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {note.title}
                      </h3>
                      
                      <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-4 flex-1 whitespace-pre-wrap">
                        {note.body}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {note.tags.map(tag => (
                          <span 
                            key={tag} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTag(tag);
                            }}
                            className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md hover:bg-blue-100 hover:text-blue-600 cursor-pointer transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="bg-slate-100 p-6 rounded-full mb-4">
                  <TagIcon className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">메모를 찾을 수 없습니다</h3>
                <p className="text-slate-500 max-w-xs mt-2 text-sm italic">
                  {searchQuery || selectedTag 
                    ? "다른 검색어나 필터를 사용해 보세요." 
                    : "새로운 메모를 작성하고 정보를 관리해 보세요."}
                </p>
                {(searchQuery || selectedTag) && (
                  <button 
                    onClick={() => { setSearchQuery(""); setSelectedTag(null); }}
                    className="mt-6 text-blue-600 font-semibold text-sm hover:underline"
                  >
                    필터 초기화
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  새 메모 작성
                </h2>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddNote} className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">제목</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="제목을 입력하세요"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full text-lg font-bold border-none bg-slate-50 rounded-2xl px-4 py-3 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">내용</label>
                  <textarea 
                    placeholder="메모 내용을 입력하세요..."
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    className="w-full h-48 border-none bg-slate-50 rounded-2xl px-4 py-3 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none text-sm leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">태그 (쉼표로 구분)</label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="업무, 디자인, 프로젝트..."
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                </div>
              </form>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={handleAddNote}
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                  작성 완료
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
