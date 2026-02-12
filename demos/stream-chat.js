const { request } = require('../client')

async function main() {
	try {
		console.log('--- Streaming Chat Completion ---')
		console.log('User: Write a short poem about coding.')
		process.stdout.write('AI: ')

		const response = await request({
			model: 'grok-4-1-fast-non-reasoning',
			input: 'Write a short poem about coding.',
			stream: true,
		})

		const decoder = new TextDecoder('utf-8')
		let buffer = ''

		for await (const chunk of response.body) {
			const c = decoder.decode(chunk, { stream: true })
			buffer += c
			const lines = buffer.split('\n')
			buffer = lines.pop() || ''

			for (const line of lines) {
				const trimmed = line.trim()
				if (!trimmed.startsWith('data:'))
					continue

				const data = trimmed.slice(5).trim()
				if (data === '[DONE]') {
					console.log('\n--- End of Stream ---')
					return
				}

				try {
					const parsed = JSON.parse(data)
					let content = ''

					// Handle standard chat completions format (legacy)
					if (parsed.choices?.[0]?.delta?.content) {
						content = parsed.choices[0].delta.content
					}
					// Handle new Responses API format (if structured similarly)
					else if (parsed.output?.[0]?.content?.[0]?.text) {
						content = parsed.output[0].content[0].text
					}
					// Handle potential event-based delta format
					else if (parsed.type === 'response.output_text.delta') {
						content = parsed.delta || parsed.text || ''
					}

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
