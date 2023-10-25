export type FileTypesType = string[] | null
export type MaxFileSizeType = number | null
export type FilterErrorFuncType = (type: string, file: File) => void | null
export function filterImages (images: File[], fileTypes: FileTypesType, maxFileSize: MaxFileSizeType, filterErrorFunc: FilterErrorFuncType) {
  const typeRegex = (fileTypes && fileTypes.length > 0)
    ? new RegExp(`^image\\/(${fileTypes.join('|')})$`, 'i') : null

  if (typeRegex || maxFileSize) {
    return images.filter(file => {
      const hasCorrectType = typeRegex ? typeRegex.test(file.type) : true
      const hasCorrectSize = maxFileSize ? (file.size <= maxFileSize) : true
      if (filterErrorFunc) {
        if (!hasCorrectType) {
          filterErrorFunc('type', file)
        } else if (!hasCorrectSize) {
          filterErrorFunc('size', file)
        }
      }

      return hasCorrectType && hasCorrectSize
    })
  }

  return images
}
