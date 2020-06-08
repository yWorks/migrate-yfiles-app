// Transforms that use mappings
const MAPPING_TRANSFORMS = [
  'removedMembers',
  'removedTypes',
  'namespaceChanges',
  'signatureChanges',
  'memberRenamings',
  'returnTypeChanges',
  'methodsProperties',
  'propertyTypeChanges'
]

// Transforms which refactor code but do not use mappings
const REFACTOR_TRANSFORMS = ['transformToModule', 'customTransform', 'toEs6Class']

// Transforms reused from 3rd parties
const THIRDPARTY_TRANSFORMS = [
  'replace-vars',
  'template-literals',
  'arrow-functions'
]

// All available transforms
const AVAILABLE_TRANSFORMS = [].concat(
  MAPPING_TRANSFORMS,
  REFACTOR_TRANSFORMS,
  THIRDPARTY_TRANSFORMS
)

module.exports = AVAILABLE_TRANSFORMS
