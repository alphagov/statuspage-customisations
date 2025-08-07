const statusPageUrls = {
  base: 'https://status.notifications.service.gov.uk',
  get historyPage() {
    return `${this.base}/history`;
  },
  get incidentPage() {
    return `${this.base}/incidents/2wryjrq3v9mt`;
  }
}

export { statusPageUrls }