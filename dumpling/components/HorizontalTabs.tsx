
const HorizontalTabs = ({ connectionStatus }: HorizontalTabsProps) => {
    const [chainId , setChainId] = useRecoilState(chainIdAtom)
    const [outputMint, setOutputMint] = useRecoilState(outputMintAtom)
    const [inputMint, setInputMint ] = useRecoilState(inputMintAtom)
    const navigation = useNavigation();
    const { detailedInfo } = useGlobalSearchParams<{ detailedInfo: string }>();
  
    console.log("Detailed Info From Params : ", detailedInfo)
  
    if(detailedInfo){
      const parsedDetailedInfo = JSON.parse(detailedInfo || 'null');
       
      setChainId(parsedDetailedInfo.chainId)
      
      console.log("ChainId set to : ", chainId)
    }
  
        
  
  
    const [tokenInfo, setTokenInfo] = useState<TokenBasicInfo | null>(null);
  
  
  
    const closeModal = () => {
      navigation.goBack();
    };
  
    useEffect(() => {
      try {
        console.log("Detailed Info after detailed info changed : ", detailedInfo)
        const parsedDetailedInfo = JSON.parse(detailedInfo || 'null');
        // console.log('Parsed detailedInfo:', parsedDetailedInfo);
  
        setChainId(parsedDetailedInfo.chainId)
  
        if(chainId === "ethereum"){
          setInputMint("0x1234567890abcdef1234567890abcdef12345678")
        }
        
  
        setOutputMint(parsedDetailedInfo.baseAddress)
        
        
        setTokenInfo(parsedDetailedInfo);
       
      } catch (error) {
        console.error('Error parsing detailedInfo:', error);
        setTokenInfo(null);
      }
    }, [detailedInfo]);
  
    const [buyInput, setBuyInput] = useState('');
    const [sellInput, setSellInput] = useState('');
    const [activeTab, setActiveTab] = useState('tab1');
  
    const buyInputLength = useSharedValue(buyInput.length);
    const sellInputLength = useSharedValue(sellInput.length);
  
    const handleBuyPress = (num: string) => {
      setBuyInput((prev) => {
        const newValue = prev + num;
        buyInputLength.value = newValue.length;
        return newValue;
      });
    };
  
    const handleSellPress = (num: string) => {
      setSellInput((prev) => {
        const newValue = prev + num;
        sellInputLength.value = newValue.length;
        return newValue;
      });
    };
  
    const handleBackspace = (inputType: 'buy' | 'sell') => {
      if (inputType === 'buy') {
        setBuyInput((prev) => {
          const newValue = prev.slice(0, -1);
          buyInputLength.value = newValue.length;
          return newValue;
        });
      } else {
        setSellInput((prev) => {
          const newValue = prev.slice(0, -1);
          sellInputLength.value = newValue.length;
          return newValue;
        });
      }
    };
  
    const animatedStyle = (inputLength: Animated.SharedValue<number>) =>
      useAnimatedStyle(() => {
        const fontSize = inputLength.value > 8 ? withTiming(40) : withTiming(60);
        return {
          fontSize,
          color: '#FFFFFF',
          fontWeight: 'bold',
          position: 'absolute',
          top: 20,
        };
      });
  
    interface CryptoCardProps {
      item: TokenBasicInfo;
      onPress: () => void;
      input: string;
    }
  
    const CryptoCard = ({ item, onPress, input }: CryptoCardProps) => (
      <Pressable onPress={onPress}>
        <XStack
          alignSelf="center"
          justifyContent="center"
          width="100%"
          maxHeight={100}
          maxWidth={360}
          paddingBottom={'$5'}>
          <Card borderRadius={'$12'} scale={0.8} alignSelf="center">
            <CardHeader>
              <XStack alignItems="center">
                <Avatar circular size="$3">
                  <Avatar.Image accessibilityLabel={item.name} src={item.imageUrl} />
                  <Avatar.Fallback backgroundColor="$blue10" />
                </Avatar>
                <YStack space={8} flex={1} paddingLeft={'$5'}>
                  <Text color={'white'} alignSelf="center" fontSize={18} fontWeight="bold">
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#fff' }}>${item.priceUsd}</Text>
                </YStack>
                <Text
                  style={{
                    fontSize: 20,
                    color: item.priceChange >= 0 ? '#00FF00' : '#FF0000',
                  }}>
                  {(parseFloat(input) / parseFloat(item.priceUsd)).toFixed(6)} {item.symbol}
                </Text>
              </XStack>
            </CardHeader>
          </Card>
        </XStack>
      </Pressable>
    );
  
    const renderNumpad = (inputType: 'buy' | 'sell') => (
      <YStack width="100%" alignItems="center" marginTop={20}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['.', '0', '←'],
        ].map((row, i) => (
          <XStack
            key={i}
            space
            justifyContent="space-between"
            width="100%"
            maxWidth={360}
            marginBottom={10}>
            {row.map((num) => (
              <Button
                key={num}
                size="$5"
                backgroundColor="#000000"
                borderRadius={10}
                onPress={() => {
                  if (num === '←') handleBackspace(inputType);
                  else if (inputType === 'buy') handleBuyPress(num);
                  else handleSellPress(num);
                }}>
                <Text color="#FFFFFF" fontSize={24}>
                  {num}
                </Text>
              </Button>
            ))}
          </XStack>
        ))}
      </YStack>
    );
  
    const { height, width } = useWindowDimensions();
  
    return (
      <Tabs
        defaultValue="tab1"
        orientation="horizontal"
        flexDirection="column"
        width={width - 40}
        height={height - 100}
        borderRadius="$4"
        overflow="hidden">
        <Tabs.List aria-label="Manage your account" paddingBottom={'$10'}>
          <Tabs.Tab flex={1} value="tab1">
            <SizableText fontFamily="$body">BUY</SizableText>
          </Tabs.Tab>
          <Tabs.Tab flex={1} value="tab2">
            <SizableText fontFamily="$body">SELL</SizableText>
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Content value="tab1" flex={1}>
          <YStack flex={1} alignItems="center" justifyContent="center" gap={'$10'}>
            <XStack
              justifyContent="center"
              alignItems="center"
              width="100%"
              maxWidth={360}
              paddingBottom={'$7'}>
              <Animated.Text style={animatedStyle(buyInputLength)}>+{buyInput || '0'}</Animated.Text>
            </XStack>
            {tokenInfo ? (
              <CryptoCard item={tokenInfo} input={buyInput} onPress={closeModal} />
            ) : (
              <Text>No token information available</Text>
            )}
            {renderNumpad('buy')}
          </YStack>
        </Tabs.Content>
  
        <Tabs.Content value="tab2" flex={1}>
          <YStack flex={1} alignItems="center" justifyContent="center" gap={'$10'}>
            <XStack
              justifyContent="center"
              alignItems="center"
              width="100%"
              maxWidth={360}
              paddingBottom={'$7'}>
              <Animated.Text style={animatedStyle(sellInputLength)}>
                -{sellInput || '0'}
              </Animated.Text>
            </XStack>
            {tokenInfo && (
              <CryptoCard
                item={tokenInfo}
                input={sellInput}
                onPress={() => {
                  console.log(`Clicked on ${tokenInfo.name}`);
                }}
              />
            )}
            {renderNumpad('sell')}
          </YStack>
        </Tabs.Content>
      </Tabs>
    );
  };