export const PREMIUM_DONATION_CENTS = 990

export interface PixDonationDetails {
  key: string
  receiverName: string
  receiverCity: string
  copyPaste: string
}

function emvField(id: string, value: string): string {
  const length = Buffer.byteLength(value, 'utf8')
  if (length > 99) throw new Error(`O campo ${id} do Pix excede o tamanho permitido.`)
  return `${id}${String(length).padStart(2, '0')}${value}`
}

function normalizePixText(value: string, maxLength: number, label: string): string {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!normalized || Buffer.byteLength(normalized, 'utf8') > maxLength) {
    throw new Error(`${label} deve ter entre 1 e ${maxLength} caracteres alfanuméricos.`)
  }
  return normalized
}

function crc16CcittFalse(value: string): string {
  let crc = 0xffff
  for (const byte of Buffer.from(value, 'utf8')) {
    crc ^= byte << 8
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function buildPixCopyPaste(key: string, receiverName: string, receiverCity: string): string {
  const amount = (PREMIUM_DONATION_CENTS / 100).toFixed(2)
  const merchantAccount = emvField('00', 'br.gov.bcb.pix') + emvField('01', key)
  const additionalData = emvField('05', '***')
  const payload =
    emvField('00', '01') +
    emvField('01', '11') +
    emvField('26', merchantAccount) +
    emvField('52', '0000') +
    emvField('53', '986') +
    emvField('54', amount) +
    emvField('58', 'BR') +
    emvField('59', receiverName) +
    emvField('60', receiverCity) +
    emvField('62', additionalData) +
    '6304'

  return `${payload}${crc16CcittFalse(payload)}`
}

export function getPixDonationDetails(): PixDonationDetails | undefined {
  const key = process.env.PIX_DONATION_KEY?.trim()
  const configuredName = process.env.PIX_DONATION_NAME?.trim()
  const configuredCity = process.env.PIX_DONATION_CITY?.trim()
  const values = [key, configuredName, configuredCity]
  if (values.every((value) => !value)) return undefined
  if (values.some((value) => !value)) {
    throw new Error('Configure PIX_DONATION_KEY, PIX_DONATION_NAME e PIX_DONATION_CITY.')
  }
  if (
    Buffer.byteLength(key!, 'utf8') > 77 ||
    [...key!].some((character) => {
      const code = character.charCodeAt(0)
      return code < 32 || code === 127
    })
  ) {
    throw new Error('PIX_DONATION_KEY excede o tamanho ou contém caracteres inválidos.')
  }

  const receiverName = normalizePixText(configuredName!, 25, 'PIX_DONATION_NAME')
  const receiverCity = normalizePixText(configuredCity!, 15, 'PIX_DONATION_CITY')
  return {
    key: key!,
    receiverName,
    receiverCity,
    copyPaste: buildPixCopyPaste(key!, receiverName, receiverCity),
  }
}
