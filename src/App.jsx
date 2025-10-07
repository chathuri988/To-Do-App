import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'active', 'completed'
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos')
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }
  }, [])

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  // Add new todo
  const addTodo = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      const newTodo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      }
      setTodos([newTodo, ...todos])
      setInputValue('')
    }
  }

  // Toggle todo completion
  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  // Delete todo
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  // Start editing todo
  const startEditing = (id, text) => {
    setEditingId(id)
    setEditingText(text)
  }

  // Save edited todo
  const saveEdit = (e) => {
    e.preventDefault()
    if (editingText.trim()) {
      setTodos(todos.map(todo => 
        todo.id === editingId ? { ...todo, text: editingText.trim() } : todo
      ))
      setEditingId(null)
      setEditingText('')
    }
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null)
    setEditingText('')
  }

  // Clear completed todos
  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed))
  }

  // Toggle all todos
  const toggleAll = () => {
    const allCompleted = todos.every(todo => todo.completed)
    setTodos(todos.map(todo => ({ ...todo, completed: !allCompleted })))
  }

  // Filter todos based on current filter and search term
  const filteredTodos = todos.filter(todo => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && !todo.completed) || 
      (filter === 'completed' && todo.completed)
    
    const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  // Count todos
  const activeCount = todos.filter(todo => !todo.completed).length
  const completedCount = todos.filter(todo => todo.completed).length

  return (
    <div className="app">
      <header className="app-header">
        <h1>📝 Todo App</h1>
        <p>Stay organized and get things done!</p>
      </header>

      <main className="app-main">
        {/* Add todo form */}
        <form onSubmit={addTodo} className="add-todo-form">
          <div className="input-group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="What needs to be done?"
              className="todo-input"
              autoFocus
            />
            <button type="submit" className="add-button">
              Add
            </button>
          </div>
        </form>

        {/* Search and filter controls */}
        <div className="controls">
          <div className="search-group">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search todos..."
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({todos.length})
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({activeCount})
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Todo list */}
        {todos.length > 0 && (
          <div className="todo-list-container">
            {todos.length > 1 && (
              <div className="bulk-actions">
                <button onClick={toggleAll} className="toggle-all-btn">
                  {todos.every(todo => todo.completed) ? 'Uncheck All' : 'Check All'}
                </button>
                {completedCount > 0 && (
                  <button onClick={clearCompleted} className="clear-completed-btn">
                    Clear Completed ({completedCount})
                  </button>
                )}
              </div>
            )}

            <ul className="todo-list">
              {filteredTodos.map(todo => (
                <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                  {editingId === todo.id ? (
                    <form onSubmit={saveEdit} className="edit-form">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="edit-input"
                        autoFocus
                        onBlur={saveEdit}
                      />
                      <div className="edit-buttons">
                        <button type="submit" className="save-btn">Save</button>
                        <button type="button" onClick={cancelEdit} className="cancel-btn">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="todo-content">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id)}
                          className="todo-checkbox"
                        />
                        <span className="todo-text">{todo.text}</span>
                        <span className="todo-date">
                          {new Date(todo.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="todo-actions">
                        <button
                          onClick={() => startEditing(todo.id, todo.text)}
                          className="edit-btn"
                          title="Edit todo"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="delete-btn"
                          title="Delete todo"
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>

            {filteredTodos.length === 0 && searchTerm && (
              <div className="no-results">
                <p>No todos found matching "{searchTerm}"</p>
                <button onClick={() => setSearchTerm('')} className="clear-search-btn">
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}

        {todos.length === 0 && (
          <div className="empty-state">
            <h3>No todos yet!</h3>
            <p>Add your first todo above to get started.</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="keyboard-shortcuts">
          <small>
            <strong>Shortcuts:</strong> Enter to add • Escape to cancel edit
          </small>
        </div>
      </footer>
    </div>
  )
}

export default App
