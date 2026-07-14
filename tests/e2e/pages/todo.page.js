class TodoPage {
  constructor(page) {
    this.page = page;
    this.titleInput = page.getByLabel('Task Title');
    this.descriptionInput = page.getByLabel('Description');
    this.dueDateInput = page.getByLabel('Due Date');
    this.addButton = page.getByRole('button', { name: 'Add Task' });
    this.statusSelect = page.getByLabel('Status');
  }

  async goto() {
    await this.page.goto('/');
  }

  async createTodo({ title, description = '', dueDate = '' }) {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);
    await this.dueDateInput.fill(dueDate);
    await this.addButton.click();
  }

  todoRow(title) {
    return this.page.locator('li').filter({ hasText: title });
  }

  async toggleTodo(title) {
    await this.todoRow(title).getByRole('checkbox').click();
  }

  async editTodo({ currentTitle, nextTitle }) {
    const row = this.todoRow(currentTitle);
    await row.getByLabel(`edit ${currentTitle}`).click();
    await this.titleInput.fill(nextTitle);
    await this.page.getByRole('button', { name: 'Save Task' }).click();
  }

  async deleteTodo(title) {
    await this.todoRow(title).getByLabel(`delete ${title}`).click();
  }

  async setStatusFilter(filterName) {
    await this.statusSelect.click();
    await this.page.getByRole('option', { name: filterName }).click();
  }
}

module.exports = { TodoPage };
