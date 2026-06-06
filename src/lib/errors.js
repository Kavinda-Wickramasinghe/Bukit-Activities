export function getErrorMessage(error, fallback = 'Something went wrong.') {
	if (!error) return fallback
	if (typeof error === 'string') return error
	if (error.message) return error.message
	if (error.error_description) return error.error_description
	return fallback
}

export function notifyError(setToast, error, fallback) {
	setToast({ type: 'error', text: getErrorMessage(error, fallback) })
}
