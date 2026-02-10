const { request } = require('../client')

async function main() {
	try {
		console.log('--- JSON Mode Demo ---')
		console.log('User: Return a JSON object describing a fictional character with a fixed schema.')

		const completion = await request({
			model: 'grok-4-1-fast-non-reasoning',
			messages: [
				{
					role: 'system',
					content: 'You are a helpful assistant designed to output JSON.',
				},
				{
					role: 'user',
					content: [
						'Return a JSON object with this exact schema:',
						'{',
						'  "name": string,',
						'  "age": number,',
						'  "class": "warrior" | "mage" | "archer",',
						'  "inventory": [',
						'    {',
						'      "name": string,',
						'      "quantity": number',
						'    }',
						'  ]',
						'}',
						'Do not include any extra fields or any non-JSON text.',
					].join('\n'),
				},
			],
			response_format: { type: 'json_object' },
		})

		const content = completion.choices[0].message.content
		console.log('Raw Output:')
		console.log(content)

		try {
			const parsed = JSON.parse(content)
			console.log('\nParsed Object:')
			console.log(parsed)
		} catch (e) {
			console.error('Failed to parse JSON')
		}
	} catch (error) {
		console.error('Error:', error)
	}
}

main()
