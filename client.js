const env = require('./.env.js')
const url = `${env.OPENAI_BASE_URL}/v1/responses`

async function request(body = {}) {
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

	if (body.stream) {
		return response
	}

	return response.json()
}

module.exports = {
	request,
}
