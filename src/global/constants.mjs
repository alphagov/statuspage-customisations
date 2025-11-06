const mainContainerMap = {
  '/': '.masthead-container + .container',
  '/history': '.months-container',
  '/incidents': '.incident-updates-container'
}

const incidentLevelMap = {
  'impact-none': 'No incident',
  'impact-maintenance': 'Maintenance',
  'impact-minor': 'Minor incident',
  'impact-major': 'Major incident',
  'impact-critical': 'Critical incident'
}

const incidentsListMap = {
  '/': '.incidents-list',
  '/history': '.months-container'
}

export { mainContainerMap, incidentLevelMap, incidentsListMap }
