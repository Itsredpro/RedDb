const { error, warn } = require("console")
const fs = require("fs")

module.exports.debug = false
module.exports.databaseheadpath = __dirname + "/saves"
module.exports.extentiontype = '.json'
module.exports.maxOnreadyTimeMS = 20000
module.exports.throwDangerousData = true

class reddbDatabaseHandle {
    constructor(dbname, dbpath,dbmaxsize=100000, done,destroy){
        if (typeof dbname != "string" || typeof dbpath != "string" || typeof dbmaxsize != ('number' || 'bigint')){
            throw new error("[Reddb] [internal handle] - CRIT ERR!: invalid constructor input types!")
        }
        this.cache = {}
        this.filepath = dbpath
        this.maxsize = dbmaxsize
        this.destroy = destroy
        this.loaded = false
        

        var doThrow = false

        (async ()=>{
            try {
                const strData = await fs.readFileSync(dbpath).toString()
                if (strData.indexOf("__dirname__") != -1){
                    console.warn(`[Reddb] [internal handle] - CRIT WARNING: '${dbname}' has been loaded with potentially harmful/corrupted data.`)
                    if (module.exports.throwDangerousData){
                        warn(`[Reddb] [${dbname}] - CRIT INFO: Threw away live database because of setting 'throwDangerousData'. Destroying current instance.`)
                        doThrow = true
                    }
                }
                if (!doThrow){
                    const jsonData = JSON.parse(strData)
                    this.cache = jsonData
                }
            } catch(e){
                throw new error("[Reddb] [internal handle] - CRIT ERROR!: Nodejs ERR: " + e)
            }

            if (doThrow){
                this.destroy()
                this = null;
                return null
            }

            this.loaded = true
            done()
        })()
    }

    get save(){
        (async ()=>{
            try {
                await fs.writeFileSync(path, JSON.stringify(this.cache))
            } catch (e){
                console.warn(`[Reddb] [internal handle] - CRIT WARNING!: Failed to write data to ${this.filepath}.\nError Message:\n${e}`)
            }
        })()
    }

    set edit({key,value}){
        //if no value, then do not edit

        if (!key){
            return warn("[Reddb] [internal handle] - CRIT WARNING: You gave me no key to work with. What the f do you expect me to do?!!?")
        }
        if (value){
            this.cache[key] = value //this is sketchy but it works
        }

        return this.cache[key]
    }
    set exist(key){
        return this.cache[key] === undefined ? false : true
    }

}

function saver(){
    if (this.databaseLoaded){
        this.handle.save()
    }
}


class reddbDatabase {
    constructor(dbName=null){
        this.DBNAME = dbName || ''
        this.databaseLoaded = false
        this.dbcharsize = 100000
        this.saveTimeMS = 5000

        this.cInterval = setInterval(saver, this.saveTimeMS)
    }
    get loadData(){
        if (typeof this.DBNAME != "string" || this.DBNAME == ''){
            warn("[Reddb] [internal] - WARNING! No database name set!")
            return null
        }

        return new Promise(async (resolve, reject)=>{
            const constructedPath = module.exports.databaseheadpath + '/' + this.DBNAME + module.exports.extentiontype
            if (!await fs.existsSync(constructedPath)){
                throw new error("[Reddb] [internal] - CRITICAL ERROR!: Database not found at constructed path!")
            }

            this.handle = new reddbDatabaseHandle(this.DBNAME, constructedPath, this.dbcharsize, ()=>{
                this.databaseLoaded = true
                resolve()
            }, ()=>{
                //Destroy self
                this = null;
                reject()
            })


            
        })
    }
    get onReady(){
        if (this.databaseLoaded){
            return null
        }

        return new Promise((resolve, reject)=>{
            const startTime = Date.now()

            var waitInterval = setInterval(()=>{
                if (this.databaseLoaded){
                    clearInterval(waitInterval)
                    resolve()
                }
                if (Date.now() - startTime > module.exports.maxOnreadyTimeMS){
                    console.warn('[Reddb] [onReady] - ERROR! Database failed to ready within the time limit ('+module.exports.maxOnreadyTimeMS+')')
                    reject()
                }
            },1000)
        })
    }

    set setName(name){
        if (typeof name != 'string' || name == ''){
            return null
        }
        if (this.databaseLoaded){
            console.warn('[Reddb] [internal] WARNING! Database is already loaded. Ignoring the change of DB Name.')
            return null
        }
        this.DBNAME = name
    }
    set setData({key,value}){
        if (!this.databaseLoaded){
            console.warn('[Reddb] [internal] Database not loaded yet.')
            return null
        }
        if (typeof key != 'string' || key == '' || !value){
            console.error('[Reddb] [internal] Invalid data type or missing value for key/value.')
            return null
        }
        return this.handle.edit({key,value})
       
    }
    set getData(key){
        if (!this.databaseLoaded){
            console.warn('[Reddb] [internal] Database not loaded yet.')
            return null
        }
        if (typeof key != 'string' || key == ''){
            console.error('[Reddb] [internal] Invalid data type or missing value for key "'+key+'".')
            return null
        }
        if (this.handle.exist(key)){
            return this.handle.edit({key})
        } else {
            return undefined
        }
        
    }
    set setSaveInterval(intervalMS){
        clearInterval(this.cInterval)
        this.saveTimeMS = intervalMS
        this.cInterval = setInterval(saver, this.saveTimeMS)
    }
}

module.exports.reddb = reddbDatabase