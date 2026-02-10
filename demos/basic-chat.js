const { request } = require('../client')

async function main() {
	try {
		console.log('--- Basic Chat Completion ---')
		console.log('User: Hello, introduce yourself in one sentence.')

		const completion = await request({
			messages: [{ role: 'user', content: 'Hello, introduce yourself in one sentence.' }],
			model: 'grok-4-1-fast-non-reasoning',
		})

		console.log(`AI: ${completion.choices[0].message.content}`)
	} catch (error) {
		console.error('Error:', error)
	}
}

main()
