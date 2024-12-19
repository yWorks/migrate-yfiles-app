export class StatisticsReport {
  exceptions: string[] = []
  changeCount: Record<string, number> = {}

  constructor() {}

  addChangeCount(category: string, count: number) {
    const hasCategory = Object.hasOwn(this.changeCount, category)
    if (!hasCategory) {
      this.changeCount[category] = count
    } else {
      this.changeCount[category] += count
    }
  }
  getTotalChanges() {
    return Object.values(this.changeCount).reduce(
      (accumulator, current) => accumulator + current,
      0
    )
  }
}
