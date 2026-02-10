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
		const messages = [
			{ role: 'user', content: "What's the weather like in San Francisco, Tokyo, and Paris?" },
		]
		console.log(`User: ${messages[0].content}`)

		const tools = [
			{
				type: 'function',
				function: {
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
			},
		]

		const response = await request({
			model: 'grok-4-1-fast-non-reasoning',
			messages: messages,
			tools: tools,
			tool_choice: 'auto',
		})

		const responseMessage = response.choices[0].message
		const toolCalls = responseMessage.tool_calls

		if (toolCalls) {
			messages.push(responseMessage)

			for (const toolCall of toolCalls) {
				const functionName = toolCall.function.name
				const functionArgs = JSON.parse(toolCall.function.arguments)

				if (functionName === 'get_current_weather') {
					const functionResponse = getCurrentWeather(functionArgs.location, functionArgs.unit)

					messages.push({
						tool_call_id: toolCall.id,
						role: 'tool',
						name: functionName,
						content: functionResponse,
					})
				}
			}

			const secondResponse = await request({
				model: 'grok-4-1-fast-non-reasoning',
				messages: messages,
			})

			console.log(`AI: ${secondResponse.choices[0].message.content}`)
		} else {
			console.log(`AI: ${responseMessage.content}`)
		}
	} catch (error) {
		console.error('Error:', error)
	}
}

main()
