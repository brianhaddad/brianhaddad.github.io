function AreaGenerator() {
    this.generate = (level, biome, name) => {
        if (!biome) {
            biome = randomlyPickBiome();
        }
        const biomeKey = biomeNameToBiomeKey(biome);
        if (biomeKey !== null) {
            biomeCounts[biomeKey]++;
        }
        if (!name) {
            name = generateRandomName(level, biome);
        }

        return {
            level: level,
            biome: biome,
            name: name,
        };
    };

    const randomlyPickBiome = () => {
        let minCount = 100;
        for (const biome in biomeCounts) {
            if (biomeCounts[biome] < minCount) {
                minCount = biomeCounts[biome];
            }
        }
        const hat = [];
        for (const biome in biomeCounts) {
            if (biomeCounts[biome] === minCount) {
                hat.push(biome);
            }
        }
        const selection = hat[Math.floor(Math.random() * hat.length)];
        return biomes[selection];
    };

    const biomeNameToBiomeKey = (biomeName) => {
        for (const biome in biomes) {
            if (biomes[biome] === biomeName) {
                return biome;
            }
        }
        return null;
    };

    const generateRandomName = (level, biome) => {
        //TODO: actually randoly generate some area names!
        return `Placeholder ${biome} (lvl: ${level})`;
    };
}

const areaGenerator = new AreaGenerator();