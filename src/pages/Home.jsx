import { useState, useEffect, useRef } from "react"

const STORAGE_KEY = "notes-app.items"

function Home() {
    const [borderWidth, setBorderWidth] = useState(0)
    const [bright, setBright] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [noteTitle, setNoteTitle] = useState("")
    const [noteContent, setNoteContent] = useState("")
    const [notes, setNotes] = useState([])
    const [selectedNote, setSelectedNote] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState("")
    const [editContent, setEditContent] = useState("")
    const [currentPage, setCurrentPage] = useState("home")
    const [searchQuery, setSearchQuery] = useState("")
    const [showAddForm, setShowAddForm] = useState(false)
    const [homeViewMode, setHomeViewMode] = useState("list")
    const noteInputRef = useRef(null)

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
            setBorderWidth(Math.min(100, scrollProgress))
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        const savedNotes = localStorage.getItem(STORAGE_KEY)
        if (savedNotes) {
            try {
                setNotes(JSON.parse(savedNotes))
            } catch {
                setNotes([])
            }
        }
    }, [])

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    }, [notes])

    useEffect(() => {
        if (showAddForm && currentPage === "home") {
            focusNoteInput()
        }
    }, [showAddForm, currentPage])

    const toggleBright = () => {
        setBright(!bright)
    }

    const toggleMenu = () => {
        setMenuOpen(!menuOpen)
    }

    const focusNoteInput = () => {
        noteInputRef.current?.focus()
    }

    const addNote = () => {
        const trimmedTitle = noteTitle.trim()
        if (!trimmedTitle) {
            focusNoteInput()
            return
        }

        const now = Date.now()
        const newNote = {
            id: Date.now(),
            title: trimmedTitle,
            content: noteContent,
            lastEdited: new Date(now).toLocaleString(),
            updatedAt: now,
            status: "active",
        }

        setNotes((prev) => [newNote, ...prev])
        setNoteTitle("")
        setNoteContent("")
        setShowAddForm(false)
        focusNoteInput()
    }

    const deleteNote = (id) => {
        setNotes((prev) =>
            prev.map((note) =>
                note.id === id ? { ...note, status: "deleted" } : note
            )
        )
        if (selectedNote?.id === id) {
            setSelectedNote(null)
            setIsEditing(false)
        }
    }

    const permanentlyDeleteNote = (id) => {
        setNotes((prev) => prev.filter((note) => note.id !== id))
        if (selectedNote?.id === id) {
            setSelectedNote(null)
            setIsEditing(false)
        }
    }

    const restoreNote = (id) => {
        setNotes((prev) =>
            prev.map((note) =>
                note.id === id ? { ...note, status: "active" } : note
            )
        )
        if (selectedNote?.id === id) {
            setSelectedNote(null)
            setIsEditing(false)
        }
    }

    const archiveNote = (id) => {
        setNotes((prev) =>
            prev.map((note) =>
                note.id === id ? { ...note, status: "archived" } : note
            )
        )
        if (selectedNote?.id === id) {
            setSelectedNote(null)
            setIsEditing(false)
        }
    }

    const viewNote = (note) => {
        setSelectedNote(note)
        setIsEditing(false)
        setEditTitle(note.title)
        setEditContent(note.content || "")
    }

    const startEditing = () => {
        setIsEditing(true)
    }

    const saveEdit = () => {
        if (!editTitle.trim()) return
        const now = Date.now()

        setNotes((prev) =>
            prev.map((note) =>
                note.id === selectedNote.id
                    ? {
                        ...note,
                        title: editTitle,
                        content: editContent,
                        lastEdited: new Date(now).toLocaleString(),
                        updatedAt: now,
                    }
                    : note
            )
        )
        setSelectedNote({ ...selectedNote, title: editTitle, content: editContent, lastEdited: new Date(now).toLocaleString(), updatedAt: now })
        setIsEditing(false)
    }

    const cancelEdit = () => {
        setIsEditing(false)
        setEditTitle(selectedNote.title)
        setEditContent(selectedNote.content || "")
    }

    const closeDetailView = () => {
        setSelectedNote(null)
        setIsEditing(false)
    }

    const getNoteSortValue = (note) => {
        if (typeof note.updatedAt === "number") return note.updatedAt
        const parsed = Date.parse(note.lastEdited)
        if (!Number.isNaN(parsed)) return parsed
        return typeof note.id === "number" ? note.id : 0
    }

    const getDisplayedNotes = () => {
        let displayed = []
        switch (currentPage) {
            case "home":
                displayed = notes.filter((note) => note.status === "active")
                break
            case "archived":
                displayed = notes.filter((note) => note.status === "archived")
                break
            case "trash":
                displayed = notes.filter((note) => note.status === "deleted")
                break
            default:
                displayed = notes.filter((note) => note.status === "active")
                break
        }

        const query = searchQuery.trim().toLowerCase()
        if (query) {
            displayed = displayed.filter((note) =>
                (note.title || "").toLowerCase().includes(query)
            )
        }

        if (currentPage === "home") {
            displayed = [...displayed].sort(
                (a, b) => getNoteSortValue(b) - getNoteSortValue(a)
            )
        }

        return displayed
    }

    const visibleNotes = getDisplayedNotes()

    return (
        <>
            <div className={`min-h-screen ${bright ? "bg-white text-gray-800" : "bg-black text-white"} transition-colors duration-500`}>
                <div className="fixed top-0 left-0 right-0 backdrop-blur-lg border-b border-gray-300 z-50">
                    <h1 className="text-center py-3 font-bold text-2xl text-yellow-600 cursor-pointer">Notes App</h1>
                    <div
                        className="absolute bottom-0 left-0 h-0.5 bg-blue-700 transition-all duration-300"
                        style={{ width: `${borderWidth}%` }}
                    ></div>
                </div>

                <div className="h-20"></div>

                <div className="flex items-center justify-between px-6 pb-4">
                    <button
                        onClick={toggleMenu}
                        className={`p-2 rounded transition-colors ${bright ? "hover:bg-gray-300" : "hover:bg-gray-700"}`}
                        title="Open Menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill={bright ? "#666666" : "#ffffff"}><path d="M120-120v-80h720v80H120Zm0-320v-80h720v80H120Zm0-320v-80h720v80H120Z" /></svg>
                    </button>

                    <div className="mr-7 flex items-center gap-3">
                        <button
                            onClick={toggleBright}
                            title={bright ? "Dark Theme" : "Light Theme"}
                            className="relative cursor-pointer hover:opacity-70 transition-opacity"
                        >
                            {bright ? (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Zm0-80q88 0 158-48.5T740-375q-20 5-40 8t-40 3q-123 0-209.5-86.5T364-660q0-20 3-40t8-40q-78 32-126.5 102T200-480q0 116 82 198t198 82Zm-10-270Z" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fbbf24"><path d="M440-800v-120h80v120h-80Zm0 760v-120h80v120h-80Zm360-400v-80h120v80H800Zm-760 0v-80h120v80H40Zm708-252-56-56 70-72 58 58-72 70ZM198-140l-58-58 72-70 56 56-70 72Zm564 0-70-72 56-56 72 70-58 58ZM212-692l-72-70 58-58 70 72-56 56Zm98 382q-70-70-70-170t70-170q70-70 170-70t170 70q70 70 70 170t-70 170q-70 70-170 70t-170-70Zm283.5-56.5Q640-413 640-480t-46.5-113.5Q547-640 480-640t-113.5 46.5Q320-547 320-480t46.5 113.5Q413-320 480-320t113.5-46.5ZM480-480Z" /></svg>
                            )}
                        </button>
                    </div>
                </div>

                <div
                    className={`fixed left-0 top-20 h-full w-64 backdrop-blur-lg border-r border-gray-300 z-40 transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"} ${bright ? "bg-gray-50" : "bg-gray-900"}`}
                >
                    <div className="p-6 border-b border-gray-300 flex justify-between items-center">
                        <h2 className={`text-xl font-bold ${bright ? "text-gray-800" : "text-white"}`}>Menu</h2>
                        <button
                            onClick={toggleMenu}
                            className={`p-1 rounded transition-colors ${bright ? "hover:bg-gray-300" : "hover:bg-gray-700"}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill={bright ? "#666666" : "#ffffff"}><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" /></svg>
                        </button>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                        <button
                            onClick={() => { setCurrentPage("home"); setMenuOpen(false) }}
                            className={`w-full text-left px-4 py-2 rounded transition-colors ${currentPage === "home" ? (bright ? "bg-blue-500 text-white" : "bg-blue-700 text-white") : (bright ? "text-gray-800 hover:bg-gray-200" : "text-white hover:bg-gray-700")}`}
                        >
                            All Notes
                        </button>
                        <button
                            onClick={() => { setCurrentPage("archived"); setMenuOpen(false) }}
                            className={`w-full text-left px-4 py-2 rounded transition-colors ${currentPage === "archived" ? (bright ? "bg-blue-500 text-white" : "bg-blue-700 text-white") : (bright ? "text-gray-800 hover:bg-gray-200" : "text-white hover:bg-gray-700")}`}
                        >
                            Archived Notes
                        </button>
                        <button
                            onClick={() => { setCurrentPage("trash"); setMenuOpen(false) }}
                            className={`w-full text-left px-4 py-2 rounded transition-colors ${currentPage === "trash" ? (bright ? "bg-blue-500 text-white" : "bg-blue-700 text-white") : (bright ? "text-gray-800 hover:bg-gray-200" : "text-white hover:bg-gray-700")}`}
                        >
                            Trash
                        </button>
                    </div>
                </div>

                <div className="p-1 pl-8 text-lg font-bold text-orange-700">
                    {currentPage === "home" ? "Recent Activity" : currentPage === "archived" ? "Archived Notes" : "Trash"}
                </div>

                <div className="mx-8 mb-3">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search note by title..."
                        className={`w-full px-3 py-2 rounded border ${bright ? "bg-white border-gray-300 text-gray-800" : "bg-gray-900 border-gray-700 text-white"}`}
                    />
                </div>

                {currentPage === "home" && (
                    <div className="mx-8 mb-3 flex justify-start mt-5">
                        <button
                            onClick={() => setShowAddForm((prev) => !prev)}
                            title="Add New Note"
                            className="cursor-pointer p-2 rounded bg-green-600 hover:bg-green-500 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" /></svg>
                        </button>
                        <button
                            onClick={() => setHomeViewMode((prev) => (prev === "list" ? "grid" : "list"))}
                            title={homeViewMode === "list" ? "Grid View" : "List View"}
                            className="ml-3 cursor-pointer p-2 rounded bg-gray-600 hover:bg-gray-500 transition-colors"
                        >
                            {homeViewMode === "list" ? (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M120-520v-320h320v320H120Zm0 400v-320h320v320H120Zm400-400v-320h320v320H520Zm0 400v-320h320v320H520ZM200-600h160v-160H200v160Zm400 0h160v-160H600v160Zm0 400h160v-160H600v160Zm-400 0h160v-160H200v160Zm400-400Zm0 240Zm-240 0Zm0-240Z" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M348.5-291.5Q360-303 360-320t-11.5-28.5Q337-360 320-360t-28.5 11.5Q280-337 280-320t11.5 28.5Q303-280 320-280t28.5-11.5Zm0-160Q360-463 360-480t-11.5-28.5Q337-520 320-520t-28.5 11.5Q280-497 280-480t11.5 28.5Q303-440 320-440t28.5-11.5Zm0-160Q360-623 360-640t-11.5-28.5Q337-680 320-680t-28.5 11.5Q280-657 280-640t11.5 28.5Q303-600 320-600t28.5-11.5ZM440-280h240v-80H440v80Zm0-160h240v-80H440v80Zm0-160h240v-80H440v80ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" /></svg>
                            )}
                        </button>
                    </div>
                )}

                {currentPage === "home" && showAddForm && (
                    <div className="mx-8 my-3 p-4 rounded border border-gray-300">
                        <div className="flex flex-col gap-3">
                            <input
                                ref={noteInputRef}
                                type="text"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") addNote()
                                }}
                                placeholder="Note title..."
                                className={`flex-1 px-3 py-2 rounded border ${bright ? "bg-white border-gray-300 text-gray-800" : "bg-gray-900 border-gray-700 text-white"}`}
                            />
                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                placeholder="Note content..."
                                className={`flex-1 px-3 py-2 rounded border min-h-20 ${bright ? "bg-white border-gray-300 text-gray-800" : "bg-gray-900 border-gray-700 text-white"}`}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={focusNoteInput}
                                    className={`px-4 py-2 rounded ${bright ? "bg-blue-100 hover:bg-blue-200 text-blue-800" : "bg-blue-900 hover:bg-blue-800 text-blue-100"}`}
                                >
                                    Focus Input
                                </button>
                                <button
                                    onClick={addNote}
                                    className={`px-4 py-2 rounded ${bright ? "bg-green-100 hover:bg-green-200 text-green-800" : "bg-green-900 hover:bg-green-800 text-green-100"}`}
                                >
                                    Add Note
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {currentPage === "home" && homeViewMode === "grid" ? (
                    <div className="m-3 ml-8 mr-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {visibleNotes.length === 0 ? (
                            <div className={`col-span-full border border-gray-300 border-t-4 border-t-blue-300 rounded-[5px] p-4 ${bright ? "bg-white" : "bg-gray-900"}`}>
                                No notes yet. Add your first note above.
                            </div>
                        ) : (
                            visibleNotes.map((note) => (
                                <div key={note.id} className={`border border-gray-300 border-t-4 border-t-blue-300 rounded-[5px] p-4 ${bright ? "bg-white hover:bg-gray-100" : "bg-gray-900 hover:bg-gray-800"} transition-colors`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className={`text-xs uppercase tracking-wide ${bright ? "text-gray-500" : "text-gray-400"}`}>Note</p>
                                            <h3 className="text-lg font-semibold wrap-break-word">{note.title}</h3>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2 py-1 text-xs ${bright ? "bg-gray-100 text-gray-700" : "bg-gray-800 text-gray-200"}`}>
                                            {note.lastEdited}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex gap-2 flex-wrap">
                                        <button onClick={() => viewNote(note)} className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-blue-100 hover:bg-blue-200 text-blue-700 hover:border-blue-500" : "bg-blue-900 hover:bg-blue-800 text-blue-100 hover:border-blue-500"}`} title="View Note">
                                            <span className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81T40-500q80-143 200-224t260-81q140 0 260 81t200 224q-80 143-200 224t-260 81Z" /></svg>
                                                View
                                            </span>
                                        </button>
                                        <button onClick={() => { viewNote(note); setTimeout(() => setIsEditing(true), 0) }} className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-700 hover:border-yellow-500" : "bg-yellow-900 hover:bg-yellow-800 text-yellow-100 hover:border-yellow-500"}`} title="Edit Note">
                                            <span className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" /></svg>
                                                Edit
                                            </span>
                                        </button>
                                        <button onClick={() => archiveNote(note.id)} className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-green-100 hover:bg-green-200 text-green-700 hover:border-green-500" : "bg-green-900 hover:bg-green-800 text-green-100 hover:border-green-500"}`} title="Archive Note">
                                            <span className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="m480-240 160-160-56-56-64 64v-168h-80v168l-64-64-56 56 160 160ZM200-640v440h560v-440H200Zm0 520q-33 0-56.5-23.5T120-200v-499q0-14 4.5-27t13.5-24l50-61q11-14 27.5-21.5T250-840h460q18 0 34.5 7.5T772-811l50 61q9 11 13.5 24t4.5 27v499q0 33-23.5 56.5T760-120H200Zm16-600h528l-34-40H250l-34 40Zm264 300Z" /></svg>
                                                Archive
                                            </span>
                                        </button>
                                        <button onClick={() => deleteNote(note.id)} className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-red-100 hover:bg-red-200 text-red-700 hover:border-red-500" : "bg-red-900 hover:bg-red-800 text-red-100 hover:border-red-500"}`} title="Delete Note">
                                            <span className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
                                                Delete
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="m-3 ml-8 mr-8 border border-gray-300 border-t-4 border-t-blue-300 rounded-[5px] overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className={`${bright ? "bg-gray-100" : "bg-gray-800"}`}>
                                    <th className="px-4 py-2">Sr. No.</th>
                                    <th className="px-4 py-2">Note Title</th>
                                    <th className="px-4 py-2">Last Edited</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-300">
                                {visibleNotes.length === 0 ? (
                                    <tr>
                                        <td className="px-4 py-3" colSpan={4}>No notes yet. Add your first note above.</td>
                                    </tr>
                                ) : (
                                    visibleNotes.map((note, index) => (
                                        <tr key={note.id} className={`${bright ? "hover:bg-gray-100" : "hover:bg-gray-800"} transition-colors`}>
                                            <td className="px-4 py-2">{index + 1}</td>
                                            <td className="px-4 py-2">{note.title}</td>
                                            <td className="px-4 py-2">{note.lastEdited}</td>
                                            <td className="px-4 py-2 flex gap-2 flex-wrap">
                                                {currentPage === "trash" ? (
                                                    <>
                                                        <button
                                                            onClick={() => viewNote(note)}
                                                            className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-blue-100 hover:bg-blue-200 text-blue-700 hover:border-blue-500" : "bg-blue-900 hover:bg-blue-800 text-blue-100 hover:border-blue-500"}`}
                                                            title="View Note"
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81T40-500q80-143 200-224t260-81q140 0 260 81t200 224q-80 143-200 224t-260 81Z" /></svg>
                                                                View
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={() => restoreNote(note.id)}
                                                            className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-700 hover:border-yellow-500" : "bg-yellow-900 hover:bg-yellow-800 text-yellow-100 hover:border-yellow-500"}`}
                                                            title="Restore Note"
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M480-120q-150 0-255-105T120-480h80q0 125 87.5 212.5T480-200q125 0 212.5-87.5T780-500h80q0 150-105 255T480-120Zm-280-280q-42-29-71-75.5T80-520h80q0 45 23 85t57 61l-40 74Zm560 0 40-74q34-21 57-61t23-85h80q0 60-29 106.5T760-400l-40-74Z" /></svg>
                                                                Restore
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={() => permanentlyDeleteNote(note.id)}
                                                            className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-red-100 hover:bg-red-200 text-red-700 hover:border-red-500" : "bg-red-900 hover:bg-red-800 text-red-100 hover:border-red-500"}`}
                                                            title="Permanently Delete Note"
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
                                                                Delete Permanently
                                                            </span>
                                                        </button>
                                                    </>
                                                ) : currentPage === "archived" ? (
                                                    <>
                                                        <button
                                                            onClick={() => viewNote(note)}
                                                            className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-blue-100 hover:bg-blue-200 text-blue-700 hover:border-blue-500" : "bg-blue-900 hover:bg-blue-800 text-blue-100 hover:border-blue-500"}`}
                                                            title="View Note"
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81T40-500q80-143 200-224t260-81q140 0 260 81t200 224q-80 143-200 224t-260 81Z" /></svg>
                                                                View
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={() => { viewNote(note); setTimeout(() => setIsEditing(true), 0) }}
                                                            className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-700 hover:border-yellow-500" : "bg-yellow-900 hover:bg-yellow-800 text-yellow-100 hover:border-yellow-500"}`}
                                                            title="Edit Note"
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" /></svg>
                                                                Edit
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={() => restoreNote(note.id)}
                                                            className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-green-100 hover:bg-green-200 text-green-700 hover:border-green-500" : "bg-green-900 hover:bg-green-800 text-green-100 hover:border-green-500"}`}
                                                            title="Unarchive Note"
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M480-120q-150 0-255-105T120-480h80q0 125 87.5 212.5T480-200q125 0 212.5-87.5T780-500h80q0 150-105 255T480-120Zm-280-280q-42-29-71-75.5T80-520h80q0 45 23 85t57 61l-40 74Zm560 0 40-74q34-21 57-61t23-85h80q0 60-29 106.5T760-400l-40-74Z" /></svg>
                                                                Unarchive
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={() => deleteNote(note.id)}
                                                            className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-red-100 hover:bg-red-200 text-red-700 hover:border-red-500" : "bg-red-900 hover:bg-red-800 text-red-100 hover:border-red-500"}`}
                                                            title="Delete Note"
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
                                                                Delete
                                                            </span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => viewNote(note)}
                                                            className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-blue-100 hover:bg-blue-200 text-blue-700 hover:border-blue-500" : "bg-blue-900 hover:bg-blue-800 text-blue-100 hover:border-blue-500"}`}
                                                            title="View Note"
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81T40-500q80-143 200-224t260-81q140 0 260 81t200 224q-80 143-200 224t-260 81Z" /></svg>
                                                                View
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={() => { viewNote(note); setTimeout(() => setIsEditing(true), 0) }}
                                                            className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-700 hover:border-yellow-500" : "bg-yellow-900 hover:bg-yellow-800 text-yellow-100 hover:border-yellow-500"}`}
                                                            title="Edit Note"
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" /></svg>
                                                                Edit
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={() => archiveNote(note.id)}
                                                            className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-green-100 hover:bg-green-200 text-green-700 hover:border-green-500" : "bg-green-900 hover:bg-green-800 text-green-100 hover:border-green-500"}`}
                                                            title="Archive Note"
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="m480-240 160-160-56-56-64 64v-168h-80v168l-64-64-56 56 160 160ZM200-640v440h560v-440H200Zm0 520q-33 0-56.5-23.5T120-200v-499q0-14 4.5-27t13.5-24l50-61q11-14 27.5-21.5T250-840h460q18 0 34.5 7.5T772-811l50 61q9 11 13.5 24t4.5 27v499q0 33-23.5 56.5T760-120H200Zm16-600h528l-34-40H250l-34 40Zm264 300Z" /></svg>
                                                                Archive
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={() => deleteNote(note.id)}
                                                            className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-red-100 hover:bg-red-200 text-red-700 hover:border-red-500" : "bg-red-900 hover:bg-red-800 text-red-100 hover:border-red-500"}`}
                                                            title="Delete Note"
                                                        >
                                                            <span className="flex items-center gap-1">
                                                                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
                                                                Delete
                                                            </span>
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedNote && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className={`${bright ? "bg-white" : "bg-gray-900"} rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto`}>
                            {isEditing ? (
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold mb-4">Edit Note</h2>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className={`w-full px-3 py-2 rounded border mb-3 ${bright ? "bg-white border-gray-300 text-gray-800" : "bg-gray-800 border-gray-700 text-white"}`}
                                        placeholder="Note title..."
                                    />
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className={`w-full px-3 py-2 rounded border min-h-32 mb-4 ${bright ? "bg-white border-gray-300 text-gray-800" : "bg-gray-800 border-gray-700 text-white"}`}
                                        placeholder="Note content..."
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={saveEdit}
                                            className={`px-4 py-2 rounded ${bright ? "bg-green-100 hover:bg-green-200 text-green-800" : "bg-green-900 hover:bg-green-800 text-green-100"}`}
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className={`px-4 py-2 rounded ${bright ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-gray-800 hover:bg-gray-700 text-white"}`}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold mb-2">{selectedNote.title}</h2>
                                    <p className={`text-sm mb-4 ${bright ? "text-gray-600" : "text-gray-400"}`}>Last edited: {selectedNote.lastEdited}</p>
                                    <p className="mb-6 whitespace-pre-wrap">{selectedNote.content || "No content"}</p>

                                    <div className="flex gap-2 flex-wrap">
                                        {currentPage === "trash" ? (
                                            <>
                                                <button
                                                    onClick={() => restoreNote(selectedNote.id)}
                                                    className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-700 hover:border-yellow-500" : "bg-yellow-900 hover:bg-yellow-800 text-yellow-100 hover:border-yellow-500"}`}
                                                    title="Restore Note"
                                                >
                                                    <span className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M480-120q-150 0-255-105T120-480h80q0 125 87.5 212.5T480-200q125 0 212.5-87.5T780-500h80q0 150-105 255T480-120Zm-280-280q-42-29-71-75.5T80-520h80q0 45 23 85t57 61l-40 74Zm560 0 40-74q34-21 57-61t23-85h80q0 60-29 106.5T760-400l-40-74Z" /></svg>
                                                        Restore
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => permanentlyDeleteNote(selectedNote.id)}
                                                    className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-red-100 hover:bg-red-200 text-red-700 hover:border-red-500" : "bg-red-900 hover:bg-red-800 text-red-100 hover:border-red-500"}`}
                                                    title="Permanently Delete Note"
                                                >
                                                    <span className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
                                                        Delete Permanently
                                                    </span>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={startEditing}
                                                    className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-700 hover:border-yellow-500" : "bg-yellow-900 hover:bg-yellow-800 text-yellow-100 hover:border-yellow-500"}`}
                                                    title="Edit Note"
                                                >
                                                    <span className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" /></svg>
                                                        Edit
                                                    </span>
                                                </button>
                                                {currentPage !== "archived" && (
                                                    <button
                                                        onClick={() => archiveNote(selectedNote.id)}
                                                        className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-green-100 hover:bg-green-200 text-green-700 hover:border-green-500" : "bg-green-900 hover:bg-green-800 text-green-100 hover:border-green-500"}`}
                                                        title="Archive Note"
                                                    >
                                                        <span className="flex items-center gap-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="m480-240 160-160-56-56-64 64v-168h-80v168l-64-64-56 56 160 160ZM200-640v440h560v-440H200Zm0 520q-33 0-56.5-23.5T120-200v-499q0-14 4.5-27t13.5-24l50-61q11-14 27.5-21.5T250-840h460q18 0 34.5 7.5T772-811l50 61q9 11 13.5 24t4.5 27v499q0 33-23.5 56.5T760-120H200Zm16-600h528l-34-40H250l-34 40Zm264 300Z" /></svg>
                                                            Archive
                                                        </span>
                                                    </button>
                                                )}
                                                {currentPage === "archived" && (
                                                    <button
                                                        onClick={() => restoreNote(selectedNote.id)}
                                                        className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-green-100 hover:bg-green-200 text-green-700 hover:border-green-500" : "bg-green-900 hover:bg-green-800 text-green-100 hover:border-green-500"}`}
                                                        title="Unarchive Note"
                                                    >
                                                        <span className="flex items-center gap-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M480-120q-150 0-255-105T120-480h80q0 125 87.5 212.5T480-200q125 0 212.5-87.5T780-500h80q0 150-105 255T480-120Zm-280-280q-42-29-71-75.5T80-520h80q0 45 23 85t57 61l-40 74Zm560 0 40-74q34-21 57-61t23-85h80q0 60-29 106.5T760-400l-40-74Z" /></svg>
                                                            Unarchive
                                                        </span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNote(selectedNote.id)}
                                                    className={`cursor-pointer px-3 py-1 rounded text-sm transition-colors border-2 border-transparent ${bright ? "bg-red-100 hover:bg-red-200 text-red-700 hover:border-red-500" : "bg-red-900 hover:bg-red-800 text-red-100 hover:border-red-500"}`}
                                                    title="Delete Note"
                                                >
                                                    <span className="flex items-center gap-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" /></svg>
                                                        Delete
                                                    </span>
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={closeDetailView}
                                            className={`px-4 py-2 rounded ${bright ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-gray-800 hover:bg-gray-700 text-white"}`}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default Home
