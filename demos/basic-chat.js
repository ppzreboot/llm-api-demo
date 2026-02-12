const { request } = require('../client')

async function main() {
	try {
		console.log('--- Basic Chat Completion ---')
		console.log('User: Hello, introduce yourself in one sentence.')

		const completion = await request({
			input: 'Hello, introduce yourself in one sentence.',
			model: 'grok-4-1-fast-non-reasoning',
		})

		console.log(`AI: ${completion.output[0].content[0].text}`)
	} catch (error) {
		console.error('Error:', error)
	}
}

main()
