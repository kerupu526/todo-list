import './App.css';
import {useState, useEffect, useRef} from "react";
import {motion, AnimatePresence} from "framer-motion";
import iconData from './data/icons.json';

const allIconsFlat = Object.values(iconData).flat();

const getFirstKeyword = (iconName) => {
    const target = allIconsFlat.find(item => item.n === iconName);
    return target ? target.k.split(',')[0] : iconName;
};

const CATEGORY_MAP = {
    "All": "전체",
    "WorkAndStudy": "학업/업무",
    "TravelAndPlaces": "여행/장소",
    "DailyLifeAndTools": "일상/도구",
    "FoodAndEvents": "음식/행사",
    "HealthAndNature": "건강/자연",
    "MediaAndGames": "미디어/게임",
    "PeopleAndSocial": "사람/소셜",
    "StatusAndRest": "상태/휴식"
};

// 🎛️ ==========================================
// 🎛️ 애니메이션 통합 컨트롤 타워 (여기 숫자만 바꾸면 됨!)
// 🎛️ ==========================================

// 1. 등장할 때 애니메이션 (쫀득한 스프링 효과)
const ENTER_TRANSITION = {
    type: "tween",
    duration: 0.4,
    ease: [0.17,0.84,0.44,1]
};

// 2. 사라질 때 애니메이션 (부드러운 슬라이드 효과)
const EXIT_TRANSITION = {
    type: "tween",  // spring 대신 부드러운 tween 사용
    duration: 0.4,  // 사라지는 데 걸리는 시간 (초 단위. 추천: 0.2~0.4)
    ease: [0.17,0.84,0.44,1]  // 점점 빠르게 사라짐
};

// ==============================================

// ⭐ 상단 버튼 애니메이션 - layout 제거하여 순간이동 방지
const btnVariants = {
    hidden: {x: -100, width: 0, opacity: 0, paddingLeft: 24, paddingRight: 24, margin: 0},
    visible: {
        x: 0, width: "auto", opacity: 1, paddingLeft: 24, paddingRight: 24, margin: "0 4px",
        transition: ENTER_TRANSITION
    },
    exit: {
        x: 100, width: 0, opacity: 0, paddingLeft: 0, paddingRight: 0, margin: 0,
        transition: EXIT_TRANSITION
    }
};

// ⭐ 리스트 애니메이션 - layout 제거하여 순간이동 방지
const itemVariants = {
    hidden: {x: -100, height: 0, opacity: 0, margin: "4px 0"},
    visible: {
        x: 0, height: "auto", opacity: 1, margin: "4px 0",
        transition: ENTER_TRANSITION
    },
    exit: {
        x: 100, height: 0, opacity: 0, margin: 0,
        transition: EXIT_TRANSITION
    }
};

function App() {
    const [input, setInput] = useState("");
    const [todos, setTodos] = useState([]);

    const [selectedIcon, setSelectedIcon] = useState(allIconsFlat[0].n);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [iconSearchTerm, setIconSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const [editIcon, setEditIcon] = useState("");
    const [isEditIconPickerOpen, setIsEditIconPickerOpen] = useState(false);

    const [deletingId, setDeletingId] = useState(null);

    const addPickerRef = useRef(null);
    const editPickerRef = useRef(null);
    const addCategoryRef = useRef(null);
    const editCategoryRef = useRef(null);

    const [catScroll, setCatScroll] = useState({start: true, end: false});

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (addPickerRef.current && !addPickerRef.current.contains(event.target)) {
                setIsIconPickerOpen(false);
            }
            if (editPickerRef.current && !editPickerRef.current.contains(event.target)) {
                setIsEditIconPickerOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        let timer;
        if (isIconPickerOpen || isEditIconPickerOpen) {
            timer = setTimeout(() => {
                const target = isIconPickerOpen ? addCategoryRef.current : editCategoryRef.current;
                if (target) {
                    setCatScroll({
                        start: target.scrollLeft <= 0,
                        end: Math.ceil(target.scrollLeft + target.clientWidth) >= target.scrollWidth
                    });
                }
            }, 100);
        }
        return () => clearTimeout(timer);
    }, [isIconPickerOpen, isEditIconPickerOpen, selectedCategory]);

    const handleCategoryScroll = (e) => {
        const {scrollLeft, scrollWidth, clientWidth} = e.target;
        setCatScroll({
            start: scrollLeft <= 0,
            end: Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 1
        });
    };

    const scrollCategoryByArrow = (ref, direction) => {
        if (ref.current) {
            ref.current.scrollBy({left: direction * 180, behavior: 'smooth'});
        }
    };

    const addTodo = () => {
        if (input.trim() === "") return;
        setTodos([...todos, {id: Date.now(), text: input, completed: false, icon: selectedIcon}]);
        setInput("");
    };

    const toggleTodo = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? {...todo, completed: !todo.completed} : todo
        ));
    };

    const deleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
        setDeletingId(null);
    };

    const startEdit = (id, text, icon) => {
        setEditingId(id);
        setEditText(text);
        setEditIcon(icon);
        setIsEditIconPickerOpen(false);
    };

    const saveEdit = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? {...todo, text: editText, icon: editIcon} : todo
        ));
        setEditingId(null);
        setIsEditIconPickerOpen(false);
    };

    const handleEnter = (e) => {
        if (e.key === "Enter") addTodo();
    }
    const handleEditEnter = (e, id) => {
        if (e.key === "Enter") saveEdit(id);
    }

    const handleDeleteClick = (e, id, completed) => {
        e.stopPropagation();
        if (completed) {
            deleteTodo(id);
        } else {
            setDeletingId(id);
        }
    };

    const handleContainerClick = (id) => {
        if (editingId === id || deletingId === id) return;
        toggleTodo(id);
    };

    const completeAll = () => {
        setTodos(todos.map(todo => ({...todo, completed: true})));
    };

    const isAllCompleted = todos.length > 0 && todos.every(todo => todo.completed);

    const uncompleteAll = () => {
        setTodos(todos.map(todo => ({...todo, completed: false})));
    };

    const deleteAll = () => {
        if (window.confirm("정말로 모든 할 일을 삭제하시겠습니까?")) {
            setTodos([]);
        }
    };

    const getFilteredIcons = () => {
        let baseIcons = selectedCategory === "All" ? allIconsFlat : iconData[selectedCategory] || [];
        return baseIcons.filter(item =>
            item.n.includes(iconSearchTerm.toLowerCase()) ||
            item.k.includes(iconSearchTerm)
        );
    };

    const filteredIcons = getFilteredIcons();

    return (
        <div className="App">
            <h1 className="title">To-Do List</h1>

            <div className="todo-container">
                <div className="icon-picker-wrapper" ref={addPickerRef}>
                    <button
                        className="icon-select-btn"
                        onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
                    >
                        <span className="material-symbols-outlined">{selectedIcon}</span>
                    </button>

                    <AnimatePresence>
                        {isIconPickerOpen && (
                            <motion.div
                                className="icon-picker-popup"
                                initial={{opacity: 0, y: -10, scale: 0.95}}
                                animate={{opacity: 1, y: 0, scale: 1}}
                                exit={{opacity: 0, y: -10, scale: 0.95}}
                                transition={{duration: 0.2}}
                            >
                                <div className="category-wrapper">
                                    {!catScroll.start && (
                                        <>
                                            <div className="category-fade left"></div>
                                            <button
                                                className="category-arrow left"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    scrollCategoryByArrow(addCategoryRef, -1);
                                                }}
                                            >
                                                <span className="material-symbols-outlined">chevron_left</span>
                                            </button>
                                        </>
                                    )}

                                    <div
                                        className="category-filter"
                                        ref={addCategoryRef}
                                        onScroll={handleCategoryScroll}
                                    >
                                        {Object.entries(CATEGORY_MAP).map(([key, label]) => (
                                            <button
                                                key={key}
                                                className={`cat-btn ${selectedCategory === key ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedCategory(key);
                                                }}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>

                                    {!catScroll.end && (
                                        <>
                                            <div className="category-fade right"></div>
                                            <button
                                                className="category-arrow right"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    scrollCategoryByArrow(addCategoryRef, 1);
                                                }}
                                            >
                                                <span className="material-symbols-outlined">chevron_right</span>
                                            </button>
                                        </>
                                    )}
                                </div>

                                <input
                                    type="text" className="icon-search-input"
                                    placeholder="아이콘 검색 (ex. 집, 쇼핑)"
                                    value={iconSearchTerm}
                                    onChange={(e) => setIconSearchTerm(e.target.value)}
                                    autoFocus
                                />
                                <div className="icon-grid">
                                    {filteredIcons.length > 0 ? (
                                        filteredIcons.map(icon => (
                                            <div
                                                key={icon.n}
                                                className="icon-grid-item has-tooltip"
                                                data-tooltip={icon.k.split(',')[0]}
                                                onClick={() => {
                                                    setSelectedIcon(icon.n);
                                                    setIsIconPickerOpen(false);
                                                    setIconSearchTerm("");
                                                }}
                                            >
                                                <span className="material-symbols-outlined">{icon.n}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="icon-no-result">결과가 없습니다.</div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <input
                    type="text"
                    placeholder="할 일을 입력해주세요..."
                    className="input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleEnter}
                />

                {/* ⭐ 각 버튼을 개별 AnimatePresence로 감싸서 순간이동 방지 */}
                <motion.button
                    key="add-btn"
                    onClick={addTodo}
                    variants={btnVariants}
                    initial="hidden"
                    animate="visible"
                    style={{whiteSpace: "nowrap"}}
                >
                    추가
                </motion.button>

                <AnimatePresence mode="popLayout">
                    {todos.length > 0 && !isAllCompleted && (
                        <motion.button
                            key="complete-all-btn"
                            className="complete-all-btn"
                            onClick={completeAll}
                            variants={btnVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{whiteSpace: "nowrap"}}
                        >
                            일괄 완료
                        </motion.button>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="popLayout">
                    {isAllCompleted && (
                        <motion.button
                            key="cancel-all-btn"
                            className="cancel-all-btn"
                            onClick={uncompleteAll}
                            variants={btnVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{whiteSpace: "nowrap"}}
                        >
                            일괄 취소
                        </motion.button>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="popLayout">
                    {isAllCompleted && (
                        <motion.button
                            key="delete-all-btn"
                            className="delete-all-btn"
                            onClick={deleteAll}
                            variants={btnVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{whiteSpace: "nowrap"}}
                        >
                            전체 삭제
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <ul>
                <AnimatePresence mode="popLayout">
                    {todos.length === 0 ? (
                        <motion.div
                            key="empty"
                            className="empty-message"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                        >
                            리스트가 비어있습니다.
                        </motion.div>
                    ) : (
                        todos.map((item) => (
                            <motion.li
                                className="item-list"
                                key={item.id}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                <div
                                    className={`item-container ${item.completed ? 'completed' : ''}`}
                                    onClick={() => handleContainerClick(item.id)}
                                >
                                    {deletingId === item.id ? (
                                        <>
                                            <div className="item-text text-danger">정말로 삭제하시겠습니까?</div>
                                            <div className="item-delete" onClick={(e) => {
                                                e.stopPropagation();
                                                deleteTodo(item.id);
                                            }}>확인
                                            </div>
                                            <div className="item-edit" onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletingId(null);
                                            }}>취소
                                            </div>
                                        </>
                                    ) : editingId === item.id ? (
                                        <>
                                            <div className="icon-picker-wrapper"
                                                 ref={editingId === item.id ? editPickerRef : null}>
                                                <button
                                                    className="list-icon-edit-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsEditIconPickerOpen(!isEditIconPickerOpen);
                                                    }}
                                                >
                                                    <span className="material-symbols-outlined">{editIcon}</span>
                                                </button>

                                                <AnimatePresence>
                                                    {isEditIconPickerOpen && (
                                                        <motion.div className="icon-picker-popup edit-popup">
                                                            <div className="category-wrapper">
                                                                {!catScroll.start && (
                                                                    <>
                                                                        <div className="category-fade left"></div>
                                                                        <button
                                                                            className="category-arrow left"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                scrollCategoryByArrow(editCategoryRef, -1);
                                                                            }}
                                                                        >
                                                                            <span
                                                                                className="material-symbols-outlined">chevron_left</span>
                                                                        </button>
                                                                    </>
                                                                )}

                                                                <div
                                                                    className="category-filter"
                                                                    ref={editCategoryRef}
                                                                    onScroll={handleCategoryScroll}
                                                                >
                                                                    {Object.entries(CATEGORY_MAP).map(([key, label]) => (
                                                                        <button
                                                                            key={key}
                                                                            className={`cat-btn ${selectedCategory === key ? 'active' : ''}`}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedCategory(key);
                                                                            }}
                                                                        >
                                                                            {label}
                                                                        </button>
                                                                    ))}
                                                                </div>

                                                                {!catScroll.end && (
                                                                    <>
                                                                        <div className="category-fade right"></div>
                                                                        <button
                                                                            className="category-arrow right"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                scrollCategoryByArrow(editCategoryRef, 1);
                                                                            }}
                                                                        >
                                                                            <span
                                                                                className="material-symbols-outlined">chevron_right</span>
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>

                                                            <input
                                                                type="text" className="icon-search-input"
                                                                placeholder="아이콘 검색..."
                                                                value={iconSearchTerm}
                                                                onChange={(e) => setIconSearchTerm(e.target.value)}
                                                                onClick={(e) => e.stopPropagation()} autoFocus
                                                            />
                                                            <div className="icon-grid">
                                                                {filteredIcons.map(icon => (
                                                                    <div
                                                                        key={icon.n}
                                                                        className="icon-grid-item has-tooltip"
                                                                        data-tooltip={icon.k.split(',')[0]}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setEditIcon(icon.n);
                                                                            setIsEditIconPickerOpen(false);
                                                                            setIconSearchTerm("");
                                                                        }}
                                                                    >
                                                                        <span
                                                                            className="material-symbols-outlined">{icon.n}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            <input
                                                className="edit-input" value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => handleEditEnter(e, item.id)} autoFocus
                                            />
                                            <div className="item-edit" onClick={(e) => {
                                                e.stopPropagation();
                                                saveEdit(item.id);
                                            }}>저장
                                            </div>
                                            <div className="item-edit" onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingId(null);
                                            }}>취소
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="item-text">
                                                <div
                                                    className="has-tooltip list-icon-wrapper"
                                                    data-tooltip={getFirstKeyword(item.icon)}
                                                >
                                                    <span className="material-symbols-outlined list-icon">
                                                        {item.icon}
                                                    </span>
                                                </div>
                                                <span className={item.completed ? 'done-text' : ''}>{item.text}</span>
                                                {item.completed && <span className="done-badge">완료!</span>}
                                            </div>
                                            {!item.completed && (
                                                <div className="item-edit" onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEdit(item.id, item.text, item.icon);
                                                }}>수정</div>
                                            )}
                                            <div className="item-delete"
                                                 onClick={(e) => handleDeleteClick(e, item.id, item.completed)}>삭제
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.li>
                        ))
                    )}
                </AnimatePresence>
            </ul>
        </div>
    )
}

export default App;