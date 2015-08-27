# addressbar
Makes the addressbar of the browser work just like a normal input

## What is this thing?
How would you handle URLs if the addressbar was just an input? An input you could listen to changes, `preventDefault()` on and manually set the value without any sideeffect? What if you could think about changing the state of your application first and the URL was just something you put in the UI to reflect the change? That instead of thinking that you had to trigger an URL to make state changes in your application?

This is what this project is exploring. `STATE CHANGE -> URL` instead of `URL -> STATE CHANGE`.

The library just exposes the `addressbar`. It is a single entity in your app where you can:

```js
// At http://www.example.com

addressbar.value // "http://www.example.com"

// Change addressbar value does NOT trigger route change
addressbar.value = "http://wwww.example.com/test"; 

// Prevent route changes on hyperlinks
addressbar.addEventListener('change', function (event) {
  event.preventDefault();
  event.target.value // The value of the addressbar
});
```

This is low level code, so there is no routing logic here. Please check out [reactive-router](https://github.com/christianalfoni/reactive-router) which uses this project for an example of use.
