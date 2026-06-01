import { useEffect, useMemo, useState } from 'react'
import { supabase, hasSupabaseKeys } from './supabaseClient'

const tabConfigs = {
  master: {
    label: 'Master List',
    table: 'master_list',
    description: 'Core list of activities, places, and sources.',
    defaults: {
      last_checked: '',
      category: '',
      venue: '',
      area: '',
      activity: '',
      schedule: '',
      cost: '',
      website: '',
      whatsapp: '',
      booking_link: '',
      why_might_care: '',
    },
    fields: [
      { name: 'category', label: 'Category' },
      { name: 'venue', label: 'Venue' },
      { name: 'area', label: 'Area' },
      { name: 'activity', label: 'Activity' },
      { name: 'schedule', label: 'Schedule' },
      { name: 'cost', label: 'Cost' },
      { name: 'website', label: 'Website' },
      { name: 'whatsapp', label: 'WhatsApp' },
      { name: 'booking_link', label: 'Booking Link' },
      { name: 'why_might_care', label: 'Why Might Care' },
    ],
    tableColumns: [
      { key: 'last_checked', label: 'Last Checked' },
      { key: 'category', label: 'Category' },
      { key: 'venue', label: 'Venue' },
      { key: 'activity', label: 'Activity' },
      { key: 'area', label: 'Area' },
    ],
    autocompleteFields: ['category', 'venue', 'area', 'activity', 'schedule', 'cost', 'website', 'whatsapp', 'booking_link', 'why_might_care'],
    requiredFields: ['venue', 'activity'],
  },
  week: {
    label: 'This Week',
    table: 'this_week',
    description: 'Track current week plans and live activities.',
    defaults: {
      date: '',
      time: '',
      activity: '',
      venue: '',
      cost: '',
      why_go: '',
    },
    fields: [
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'time', label: 'Time' },
      { name: 'activity', label: 'Activity' },
      { name: 'venue', label: 'Venue' },
      { name: 'cost', label: 'Cost' },
      { name: 'why_go', label: 'Why Go' },
    ],
    tableColumns: [
      { key: 'created_at', label: 'Created' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'activity', label: 'Activity' },
      { key: 'venue', label: 'Venue' },
      { key: 'cost', label: 'Cost' },
    ],
    autocompleteFields: ['time', 'activity', 'venue', 'why_go'],
    requiredFields: ['date', 'activity'],
  },
  discoveries: {
    label: 'New Discoveries',
    table: 'new_discoveries',
    description: 'Fresh venues and activities you want to track.',
    defaults: {
      date_found: '',
      venue: '',
      activity: '',
      why_it_is_interesting: '',
    },
    fields: [
      { name: 'date_found', label: 'Date Found', type: 'date' },
      { name: 'venue', label: 'Venue' },
      { name: 'activity', label: 'Activity' },
      { name: 'why_it_is_interesting', label: 'Why It Is Interesting' },
    ],
    tableColumns: [
      { key: 'created_at', label: 'Created' },
      { key: 'date_found', label: 'Date Found' },
      { key: 'venue', label: 'Venue' },
      { key: 'activity', label: 'Activity' },
    ],
    autocompleteFields: ['venue', 'activity', 'why_it_is_interesting'],
    requiredFields: ['venue', 'activity'],
  },
  sources: {
    label: 'WhatsApp Sources',
    table: 'whatsapp_sources',
    description: 'Track WhatsApp groups and source notes.',
    defaults: {
      group_name: '',
      category: '',
      link: '',
      purpose: '',
      notes: '',
    },
    fields: [
      { name: 'group_name', label: 'Group Name' },
      { name: 'category', label: 'Category' },
      { name: 'link', label: 'Link' },
      { name: 'purpose', label: 'Purpose' },
      { name: 'notes', label: 'Notes' },
    ],
    tableColumns: [
      { key: 'created_at', label: 'Created' },
      { key: 'group_name', label: 'Group Name' },
      { key: 'link', label: 'Link' },
      { key: 'purpose', label: 'Purpose' },
    ],
    autocompleteFields: ['group_name', 'category', 'link', 'purpose', 'notes'],
    requiredFields: ['group_name', 'link'],
  },
}

const tabOrder = ['master', 'week', 'discoveries', 'sources']

function createEmptyForm(tabId) {
  return { id: null, ...(tabConfigs[tabId]?.defaults || {}) }
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getValue(record, key) {
  const value = record?.[key]
  if (value === null || value === undefined || value === '') return '—'
  return key === 'created_at' || key === 'last_checked' || key === 'date' || key === 'date_found' ? formatDate(value) : String(value)
}

function normalizeUrl(value) {
  if (!value) return null
  const s = String(value).trim()
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  return `https://${s}`
}

export default function App() {
  const [activeTab, setActiveTab] = useState('master')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [records, setRecords] = useState([])
  const [form, setForm] = useState(createEmptyForm('master'))
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const activeConfig = tabConfigs[activeTab]

  useEffect(() => {
    if (!hasSupabaseKeys) {
      setMessage({ type: 'error', text: 'Supabase keys missing or invalid — check .env' })
      return
    }

    setForm(createEmptyForm(activeTab))
    setEditingId(null)
    setErrors({})
    fetchRecords(activeTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  async function fetchRecords(tabId = activeTab) {
    const config = tabConfigs[tabId]
    if (!config) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from(config.table)
        .select('*')
        .order(config.table === 'master_list' ? 'last_checked' : 'created_at', { ascending: false })
        .order('id', { ascending: false })

      if (error) {
        setMessage({ type: 'error', text: error.message || `Failed to load ${config.label}` })
        setRecords([])
        return
      }

      setRecords(data || [])
    } catch (err) {
      setMessage({ type: 'error', text: err.message || String(err) })
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: null }))
  }

  function validate(currentConfig = activeConfig, currentForm = form) {
    const nextErrors = {}

    currentConfig.requiredFields.forEach((fieldName) => {
      const value = currentForm[fieldName]
      if (!value || String(value).trim().length < 2) {
        nextErrors[fieldName] = `${fieldName.replaceAll('_', ' ')} is required`
      }
    })

    if ('link' in currentForm && currentForm.link && !/^https?:\/\//i.test(currentForm.link)) {
      nextErrors.link = 'Link must start with http:// or https://'
    }

    if ('website' in currentForm && currentForm.website && !/^https?:\/\//i.test(currentForm.website)) {
      nextErrors.website = 'Website must start with http:// or https://'
    }

    if ('cost' in currentForm && currentForm.cost && Number.isNaN(Number(currentForm.cost))) {
      nextErrors.cost = 'Cost must be a number'
    }

    return nextErrors
  }

  async function handleSubmit() {
    if (!activeConfig) return

    const nextErrors = validate()
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setMessage({ type: 'error', text: 'Please fix the highlighted fields' })
      return
    }

    const payload = Object.fromEntries(
      Object.entries(form).filter(([key]) => key !== 'id')
    )

    if (activeConfig.table === 'master_list') {
      payload.last_checked = new Date().toISOString()
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from(activeConfig.table)
          .update(payload)
          .eq('id', editingId)

        if (error) {
          setMessage({ type: 'error', text: error.message || 'Update failed' })
          return
        }

        setMessage({ type: 'success', text: `${activeConfig.label} updated successfully` })
      } else {
        const { error } = await supabase.from(activeConfig.table).insert([payload])

        if (error) {
          setMessage({ type: 'error', text: error.message || 'Insert failed' })
          return
        }

        setMessage({ type: 'success', text: `${activeConfig.label} added successfully` })
      }

      await fetchRecords()
      resetForm()
    } catch (err) {
      setMessage({ type: 'error', text: err.message || String(err) })
    }

    setTimeout(() => setMessage(null), 3500)
  }

  function handleEdit(record) {
    setEditingId(record.id)
    setForm({ id: record.id, ...activeConfig.defaults, ...record })
    setErrors({})
    setMessage(null)
  }

  function resetForm() {
    setForm(createEmptyForm(activeTab))
    setEditingId(null)
    setErrors({})
  }

  const suggestionsByField = useMemo(() => {
    const fields = activeConfig?.autocompleteFields || []
    return fields.reduce((acc, fieldName) => {
      const values = records
        .map((record) => record?.[fieldName])
        .filter((value) => typeof value === 'string' && value.trim().length > 0)
      acc[fieldName] = Array.from(new Set(values)).slice(0, 8)
      return acc
    }, {})
  }, [activeConfig, records])

  return (
    <div className={`appShell ${sidebarOpen ? 'sidebarOpen' : ''}`}>
      <button
        type="button"
        className={`menuButton ${sidebarOpen ? 'hidden' : ''}`}
        aria-label="Toggle navigation"
        onClick={() => setSidebarOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className="backdrop" onClick={() => setSidebarOpen(false)} aria-hidden="true" />

      <aside className="sidebar">
        <button
          type="button"
          className="closeButton"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        >
          ×
        </button>

        <div className="brandBlock">
          <p className="eyebrow">Bukit Activities</p>
          <h1>Activity Tables</h1>
          <p className="brandNote">Manage each table from a clean, tabbed workspace with light green gradients.</p>
        </div>

        <nav className="sideNav" aria-label="Activity tables">
          {tabOrder.map((tabId) => (
            <button
              key={tabId}
              className={`navTab ${activeTab === tabId ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tabId)
                setSidebarOpen(false)
              }}
              type="button"
            >
              {tabConfigs[tabId].label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content">
        <section className="heroCard">
          <div>
            <p className="heroLabel">Database editor</p>
            <h2>{activeConfig.label}</h2>
            <p className="heroText">{activeConfig.description}</p>
          </div>
        </section>

        <section className="formCard">
          <div className="sectionHeading">
            <div>
              <h2>{editingId ? `Edit ${activeConfig.label}` : `Add ${activeConfig.label}`}</h2>
              <p>Labels stay above the fields, and matching values from the database appear as suggestions while you type.</p>
            </div>
            <button type="button" onClick={resetForm}>Reset</button>
          </div>

          {message && (
            <div className={`toast ${message.type === 'success' ? 'success' : 'error'}`} role="status">
              {message.text}
            </div>
          )}

          <div className="grid">
            {activeConfig.fields.map((field) => {
              const listId = suggestionsByField[field.name]?.length ? `${activeTab}-${field.name}-suggestions` : undefined
              return (
                <div key={field.name} className="field">
                  <label htmlFor={field.name}>{field.label}</label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type || 'text'}
                    placeholder={field.label}
                    value={form[field.name] ?? ''}
                    onChange={handleChange}
                    list={listId}
                  />
                  {listId && (
                    <datalist id={listId}>
                      {suggestionsByField[field.name].map((value) => (
                        <option key={value} value={value} />
                      ))}
                    </datalist>
                  )}
                  {errors[field.name] && <div className="errorText">{errors[field.name]}</div>}
                </div>
              )
            })}
          </div>

          <div className="actionRow">
            <button className="primary" type="button" onClick={handleSubmit}>
              {editingId ? 'Update Row' : 'Add Row'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </section>

        <section className="tabSection">
          <div className="tabHeading">
            <h2>{activeConfig.label} rows</h2>
            <p>{records.length} record{records.length === 1 ? '' : 's'} loaded from Supabase</p>
          </div>

          <div className="tableWrap">
            <table className="dataTable">
              <thead>
                <tr>
                  {activeConfig.tableColumns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    {activeConfig.tableColumns.map((column) => {
                      const raw = record?.[column.key]
                      const display = getValue(record, column.key)
                      const isLinkKey = ['website', 'booking_link', 'link'].includes(column.key)

                      if (isLinkKey && raw) {
                        const href = normalizeUrl(raw)
                        if (href) {
                          return (
                            <td key={column.key}>
                              <a href={href} target="_blank" rel="noopener noreferrer" className="tableLink">
                                {display}
                              </a>
                            </td>
                          )
                        }
                      }

                      return <td key={column.key}>{display}</td>
                    })}
                    <td>
                      <button type="button" className="tableButton" onClick={() => handleEdit(record)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {!records.length && (
                  <tr>
                    <td colSpan={activeConfig.tableColumns.length + 1} className="emptyCell">
                      No records yet. Add the first row using the form above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}