import AnswerWorker from '../workers/answer.worker'

let worker = null

const getWorker = () => {
  if (process.browser && window.Worker) {
    if (worker === null) {
      worker = new AnswerWorker()
    }
    return worker
  }
  return null
}

const killWorker = () => {
  if (worker === null) {
    return
  }
  worker.terminate()
  worker = null
}

const preloadWorker = () => {
  getWorker()
}

const checkAnswer = (answer, question, timeout = 2500) => {
  const worker = getWorker()
  return new Promise((resolve, reject) => {
    if (!worker) {
      reject('No web worker.')
    }

    // Start timeout timer
    let timer = setTimeout(() => {
      killWorker()
      reject(`Exceeded ${timeout}ms timeout.`)
    }, timeout)

    // Successful result
    worker.onmessage = e => {
      clearTimeout(timer)
      if (e.data.hasOwnProperty('success')) {
        resolve(e.data.success)
      } else if (e.data.hasOwnProperty('error')) {
        reject(e.data.error)
      }
    }

    // Error result
    worker.onerror = e => {
      clearTimeout(timer)
      reject(e.message)
    }

    // Check answer
    worker.postMessage([answer, question.params, question.tests, question.solution])
  })
}

export { preloadWorker }
export default checkAnswer
