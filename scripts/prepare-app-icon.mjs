import sharp from 'sharp'

const input = 'public/app-icon-original.png'
const output = 'public/app-icon.png'
const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

for (let index = 0; index < data.length; index += info.channels) {
	const red = data[index]
	const green = data[index + 1]
	const blue = data[index + 2]
	if (red < 24 && green < 24 && blue < 24) data[index + 3] = 0
}

await sharp(data, { raw: info }).png().toFile(output)
