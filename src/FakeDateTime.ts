export class FakeDateTime {
    private now: number = 0;
    getNextTime(): number {
        this.now++;
        return this.now;
    }
}
