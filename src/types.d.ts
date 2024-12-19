export type Changes = {
  typesRenamed: Record<string, string>
  typesRenamedInverse?: Record<string, string>
  typesRemoved: Record<string, string | null>
  membersNew: Record<string, string[]>
  typesNew: string[]
  membersRenamed: Record<string, Record<string, string>>
  staticsRenamed?: Record<string, Record<string, string>>
  membersRemoved: Record<string, Record<string, string | null>>
  membersObsolete?: Record<string, string[]>
  signaturesChanged: Record<string, Record<string, (string | number)[]>>
  propertyTypesChanged: Record<string, Record<string, string>>
  returnTypesChanged: Record<string, Record<string, string>>
  compatMethods: Record<string, string[]>
  moduleChanges: Record<string, string>
  defaultChanges?: Record<
    string,
    Record<
      string,
      {
        helpMsg: string
        values: [number | string, number | string]
        ctorPosition: number
      }
    >
  >
}
