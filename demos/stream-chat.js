const { request } = require('../client')

async function main() {
	try {
		console.log('--- Streaming Chat Completion ---')
		console.log('User: Write a short poem about coding.')
		process.stdout.write('AI: ')

		const response = await request({
			model: 'grok-4-1-fast-non-reasoning',
			messages: [{ role: 'user', content: 'Write a short poem about coding.' }],
			stream: true,
		})

		const decoder = new TextDecoder('utf-8')
		let buffer = ''

		for await (const chunk of response.body) {
			buffer += decoder.decode(chunk, { stream: true })
			const lines = buffer.split('\n')
			buffer = lines.pop() || ''

			for (const line of lines) {
				const trimmed = line.trim()
				if (!trimmed.startsWith('data:')) continue

				const data = trimmed.slice(5).trim()
				if (data === '[DONE]') {
					console.log('\n--- End of Stream ---')
					return
				}

				try {
					const parsed = JSON.parse(data)
					const content = parsed.choices?.[0]?.delta?.content || ''
					process.stdout.write(content)
				} catch (e) {
				}
			}
		}
		console.log('\n--- End of Stream ---')
	} catch (error) {
		console.error('Error:', error)
	}
}

main()
