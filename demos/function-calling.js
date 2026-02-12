const { request } = require('../client')

function getCurrentWeather(location, unit = 'celsius') {
	console.log(`\n[System] Fetching weather for ${location} in ${unit}...`)
	if (location.toLowerCase().includes('tokyo')) {
		return JSON.stringify({ location: 'Tokyo', temperature: '10', unit: 'celsius' })
	} else if (location.toLowerCase().includes('san francisco')) {
		return JSON.stringify({ location: 'San Francisco', temperature: '72', unit: 'fahrenheit' })
	} else if (location.toLowerCase().includes('paris')) {
		return JSON.stringify({ location: 'Paris', temperature: '22', unit: 'fahrenheit' })
	} else {
		return JSON.stringify({ location: location, temperature: 'unknown' })
	}
}

async function main() {
	try {
		console.log('--- Function Calling Demo ---')
		const items = [
			{ role: 'user', content: "What's the weather like in San Francisco, Tokyo, and Paris?" },
		]
		console.log(`User: ${items[0].content}`)

		const tools = [
			{
				type: 'function',
				name: 'get_current_weather',
				description: 'Get the current weather in a given location',
				parameters: {
					type: 'object',
					properties: {
						location: {
							type: 'string',
							description: 'The city and state, e.g. San Francisco, CA',
						},
						unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
					},
					required: ['location'],
				},
			},
		]

		const response = await request({
			model: 'grok-4-1-fast-non-reasoning',
			input: items,
			tools: tools,
			tool_choice: 'auto',
		})

		const outputItems = response.output || []
		items.push(...outputItems)

		const toolCalls = outputItems.filter(item => item.type === 'function_call')

		if (toolCalls.length > 0) {
			for (const toolCall of toolCalls) {
				const functionName = toolCall.name
				const functionArgs = JSON.parse(toolCall.arguments)

				if (functionName === 'get_current_weather') {
					const functionResponse = getCurrentWeather(functionArgs.location, functionArgs.unit)

					items.push({
						type: 'function_call_output',
						call_id: toolCall.call_id || toolCall.id,
						output: functionResponse,
					})
				}
			}

			const secondResponse = await request({
				model: 'grok-4-1-fast-non-reasoning',
				input: items,
			})

			const messageItem = secondResponse.output.find(item => item.type === 'message')
			if (messageItem && messageItem.content && messageItem.content[0]) {
				console.log(`AI: ${messageItem.content[0].text}`)
			}
		} else {
			const messageItem = outputItems.find(item => item.type === 'message')
			if (messageItem && messageItem.content && messageItem.content[0]) {
				console.log(`AI: ${messageItem.content[0].text}`)
			}
		}
	} catch (error) {
		console.error('Error:', error)
	}
}

main()
