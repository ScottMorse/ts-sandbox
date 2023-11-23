class MyClass {
  myMethod() {
    console.log(this.myPrivateMethod());
  }

  private myPrivateMethod() {
    return "Obamna 🥺";
  }
}

// [1, 2, 3, 4].forEach(new MyClass().myMethod);
[1, 2, 3, 4].forEach(() => new MyClass().myMethod());
