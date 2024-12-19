import { OrganicLayout } from 'yfiles'
let ol
{
  ol = new OrganicLayout({ chainRecognition: true })
  ol.automaticGroupNodeCompaction = true
}
ol.create3DLayout = true
