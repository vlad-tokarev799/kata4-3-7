const input = document.querySelector('#searchInput')
const repositoryContainer = document.querySelector('.repositories')

const repos = JSON.parse(localStorage.getItem('addedRepos'))
renderRepositoryCards((repos || []))

const inputHandler = createInputHandler()
input.addEventListener('input', inputHandler)

repositoryContainer.addEventListener('click', function(e) {
  if (e.target.classList.contains('repository__delete')) {
    const parentContainer = e.target.closest('.repository')

    const addedRepositories = JSON.parse(localStorage.getItem('addedRepos'))
    const index = addedRepositories.findIndex(repo => {
      return repo.id === Number(parentContainer.dataset.id)
    })

    addedRepositories.splice(index, 1)
    parentContainer.remove()

    localStorage.setItem('addedRepos', JSON.stringify(addedRepositories))
  }
})

function createInputHandler() {
  const fetchData = debounce(async function(url, init) {
    const response = await fetch(url, init)
    const data = await response.json()

    renderHints(data.items)
  }, 300)

  return function() {
    if (this.value) {
      const url = `https://api.github.com/search/repositories?q=${this.value}&per_page=5`

      fetchData(url, {
        headers: {
          accept: 'application/vnd.github.v3+json'
        }
      })
    } else {
      removeHints()
    }
  }
}

function debounce(fn, debounceTime) {
  let timer

  return function(...args) {
    clearTimeout(timer)

    timer = setTimeout(() => fn.call(this, ...args), debounceTime)
  }
}

function renderHints(elems) {
  const hintsContainer = document.querySelector('.hints')
  hintsContainer.innerHTML = ''

  elems.forEach(el => {
    const hint = createHint(el)
    hintsContainer.append(hint)
  })
}

function createHint(data) {
  const hint = document.createElement('div')
  hint.classList.add('hint')

  const addedRepos = JSON.parse(localStorage.getItem('addedRepos'))
  if (addedRepos) {
    let index = addedRepos.findIndex(el => el.id === data.id)

    if (index >= 0) {
      hint.classList.add('hint--active')
    }
  }

  const hintName = document.createElement('p')
  hintName.classList.add('hint__name')
  hintName.textContent = data.name

  hint.append(hintName)

  const hintHandler = () => {
    let addedRepos = JSON.parse(localStorage.getItem('addedRepos'))
    const selectedIndexInAddedRepos = (addedRepos || []).findIndex(el => el.id === data.id)

    if (addedRepos) {
      if (selectedIndexInAddedRepos < 0) {
        addedRepos.push(data)
      }
    } else {
      addedRepos = [data]
    }

    localStorage.setItem('addedRepos', JSON.stringify(addedRepos))
    renderRepositoryCards(addedRepos)

    input.value = ''
    removeHints()
  }

  hint.addEventListener('click', hintHandler)

  return hint
}

function removeHints() {
  const hintsContainer = document.querySelector('.hints')
  hintsContainer.innerHTML = ''
}

function renderRepositoryCards(repos) {
  repositoryContainer.innerHTML = ''

  repos.forEach(repo => {
    const repoCard = createRepositoryCard(repo)

    repositoryContainer.append(repoCard)
  })
}

function createRepositoryCard(data) {
  const repositoryCard = document.createElement('div')
  repositoryCard.classList.add('repository')
  repositoryCard.dataset.id = data.id

  const repositoryName = document.createElement('p')
  repositoryName.classList.add('repository__name')
  repositoryName.textContent = `${data.name}`
  repositoryCard.append(repositoryName)

  const repositoryOwner = document.createElement('p')
  repositoryOwner.classList.add('repository__owner')
  repositoryOwner.textContent = `Owner: ${data.owner.login}`
  repositoryCard.append(repositoryOwner)

  const repositoryStars = document.createElement('span')
  repositoryStars.classList.add('repository__stars')
  repositoryStars.textContent = data.stargazers_count
  repositoryCard.append(repositoryStars)

  const repositoryDelete = document.createElement('button')
  repositoryDelete.classList.add('repository__delete')
  repositoryDelete.textContent = 'Delete'
  repositoryCard.append(repositoryDelete)

  return repositoryCard
}


