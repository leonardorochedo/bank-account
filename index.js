// lib's externas
const inquirer = require('inquirer')
const chalk = require('chalk')

// lib's do node
const fs = require('fs')

// iniciando programa
operation()

// menu
function operation() {

    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'O que você deseja fazer?',
        choices: [
            'Criar Conta',
            'Consultar Saldo',
            'Depositar',
            'Sacar',
            'Contas Disponíveis',
            'Remover Conta',
            'Sair'
        ]
    }])
    .then((res) => {
        console.clear()

        const action = res['action']

        if (action === 'Criar Conta') {
            createAccount()
        } else if (action === 'Consultar Saldo') {
            consultAmount()
        } else if (action === 'Depositar') {
            deposit()
        } else if (action === 'Sacar') {
            withdraw()
        } else if (action === 'Contas Disponíveis') {
            consultAccounts()
        } else if (action === 'Remover Conta') {
            removeAccount()
        } else if (action === 'Sair') {
            console.clear()
            console.log(chalk.blue.bold('Obrigado por usar o Accounts!'))
            process.exit()
        }
    })
    .catch((err) => console.log(err))
}

// criar conta
function createAccount() {
    console.clear()
    console.log(chalk.bgGreen.black('Obrigado por escolher nós como seu banco!'))
    console.log(chalk.green('Defina as opções da conta a seguir'))

    buildAccount()
}

function buildAccount() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Digite um nome para sua conta: '
    }])
    .then((res) => {
        const accountName = res['accountName']

        // verificando se existe o diretório
        if(!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        // caso o nome da conta já exista
        if(fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Essa conta já existe, escolha outro nome!'))
            buildAccount()
            return
        }
        
        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', function(err) {
            if (err) {
                console.log(err)
                return
            }
        })

        console.log(chalk.green('Conta criada com sucesso!'))
        operation()
    })
    .catch((err) => console.log(err))
}

// outras funcionalidades
function consultAmount() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome de sua conta? '
    }])
    .then((res) => {
        const accountName = res['accountName']

        if (!verifyAccount(accountName)) {
            return consultAmount()
        }

        const balanceAccount = getAccount(accountName)
        console.log(chalk.yellow.bold(`Seu saldo é de R$${balanceAccount.balance}!`))
        operation()
    })
    .catch((err) => console.log(err))
}

function deposit() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome de sua conta? '
    }])
    .then((res) => {
        const accountName = res['accountName']

        if (!verifyAccount(accountName)) {
            return deposit()
        }

        inquirer.prompt([{
            name: 'amount',
            message: 'Quanto você quer depositar? R$'
        }])
        .then((res) => {
            const amount = res['amount']

            addAmount(accountName, amount)
            operation()
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
}

function withdraw() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome de sua conta? '
    }])
    .then((res) => {
        const accountName = res['accountName']

        if (!verifyAccount(accountName)) {
            return withdraw()
        }

        inquirer.prompt([{
            name: 'amount',
            message: 'Quanto você quer sacar? R$'
        }])
        .then((res) => {
            const amount = res['amount']

            lessAmount(accountName, amount)
            operation()
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
}

function consultAccounts() {
    const dir = fs.readdirSync('accounts', function (err, data) {
        if (err) {
            console.log(err)
        }
    })

    console.log(chalk.blue.bold("Contas já existentes: "))

    dir.forEach(account => {
        const accountName = account.split(".json")
        console.log(chalk.yellow(accountName[0]))
    });

    operation()
}

function removeAccount() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual conta você deseja remover? '
    }])
    .then((res) => {
        const accountName = res['accountName']

        if (!verifyAccount(accountName)) {
            return removeAccount()
        }

        fs.unlink(`accounts/${accountName}.json`, function (err) {
            if (err) {
                console.log(err)
                return
            }
        })

        console.log(chalk.red.bold(`Conta ${accountName} removida com sucesso!`))
        operation()
    })
    .catch((err) => console.log(err))
}

// verificando se a conta existe
function verifyAccount(accountName) {
    if(!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Essa conta não existe, escolha outra!'))
        return false
    }

    return true
}

// funcionalidades de calculo
function addAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if (!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tenta novamente mais tarde!'))
        return deposit()
    }

    accountData.balance += parseFloat(amount)

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), function(err) {
        console.log(err)
    })

    console.log(chalk.bgGreen.white.bold(`Foi depositado o valor de R$${amount} em sua conta!`))
}

function lessAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if (!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tenta novamente mais tarde!'))
        return withdraw()
    }

    accountData.balance -= parseFloat(amount)

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), function(err) {
        console.log(err)
    })

    console.log(chalk.bgRed.white.bold(`Foi retirado o valor de R$${amount} em sua conta!`))
}

// pegando a conta em json
function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}