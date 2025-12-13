export function readFileAsText(file: File): Promise<string> {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.addEventListener('loadend', () => {
      const res = reader.result
      if (typeof res === 'string') resolve(res)
      else reject(new Error('Lecture du fichier impossible.'))
    })
    reader.addEventListener('error', () => reject(new Error('Erreur de lecture fichier.')))
    reader.readAsText(file)
  })
}
