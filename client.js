const env = require('./.env.js')

async function request(body = {}) {
	const url = `${env.OPENAI_BASE_URL}/chat/completions`
	const stream = !!body.stream

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.OPENAI_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	})

	if (!response.ok) {
		const text = await response.text().catch(() => '')
		throw new Error(text || `Request failed with status ${response.status}`)
	}

	if (stream) {
		return response
	}

	return response.json()
}

module.exports = {
	request,
}
