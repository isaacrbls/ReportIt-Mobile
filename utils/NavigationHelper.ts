/**
 * Navigation Helper - Manages logical navigation flows
 * Ensures back navigation goes to the correct screen based on app logic
 */

export interface NavigationContext {
  currentScreen: string;
  previousScreen?: string;
  entryPoint?: string;
  isFirstLaunch?: boolean;
  userLoggedIn?: boolean;
}

export class NavigationHelper {
  private static readonly NAVIGATION_FLOWS = {
    'Welcome': {
      allowedNext: ['Login', 'Map'],
      logicalBack: 'EXIT_APP'
    },
    'Login': {
      allowedNext: ['Signup', 'ForgotPassword', 'Map'],
      logicalBack: 'EXIT_APP' // Never go back to Welcome
    },
    'Signup': {
      allowedNext: ['TermsAndConditions', 'Login'],
      logicalBack: 'Login'
    },
    'TermsAndConditions': {
      allowedNext: ['Signup'],
      logicalBack: 'Signup' // Always return to signup with context
    },
    'ForgotPassword': {
      allowedNext: ['Login'],
      logicalBack: 'Login'
    },
    'Map': {
      allowedNext: ['IncidentAnalysis', 'EditProfile'],
      logicalBack: 'EXIT_APP' // Map is home base
    },
    'IncidentAnalysis': {
      allowedNext: ['Map'],
      logicalBack: 'Map'
    },
    'ViewReports': {
      allowedNext: ['Map'],
      logicalBack: 'Map'
    },
    'EditProfile': {
      allowedNext: ['Map'],
      logicalBack: 'Map'
    }
  };

  /**
   * Get the logical back destination for a screen
   */
  static getLogicalBackDestination(
    currentScreen: string, 
    context: NavigationContext
  ): string | 'EXIT_APP' | 'DEFAULT' {
    const screenFlow = this.NAVIGATION_FLOWS[currentScreen as keyof typeof this.NAVIGATION_FLOWS];
    
    if (!screenFlow) {
      return 'DEFAULT';
    }

    if (currentScreen === 'Login') {
      return 'EXIT_APP';
    }

    if (currentScreen === 'Map') {
      return 'EXIT_APP';
    }

    if (currentScreen === 'TermsAndConditions') {
      return 'Signup';
    }

    if (currentScreen === 'Signup' && context.previousScreen === 'TermsAndConditions') {
      return 'Login';
    }

    return screenFlow.logicalBack || 'DEFAULT';
  }

  /**
   * Check if a navigation transition is logically valid
   */
  static isValidTransition(from: string, to: string): boolean {
    const screenFlow = this.NAVIGATION_FLOWS[from as keyof typeof this.NAVIGATION_FLOWS];
    
    if (!screenFlow) {
      return true; // Allow any transition if no rules defined
    }

    return screenFlow.allowedNext.includes(to);
  }

  /**
   * Get the appropriate entry screen based on app state
   */
  static getEntryScreen(isFirstLaunch: boolean, userLoggedIn: boolean): string {
    if (isFirstLaunch) {
      return 'Welcome';
    }
    
    if (userLoggedIn) {
      return 'Map';
    }
    
    return 'Login';
  }

  /**
   * Handle back navigation with proper context
   */
  static handleBackNavigation(
    navigation: any,
    currentScreen: string,
    context: NavigationContext,
    customParams?: any
  ): boolean {
    const destination = this.getLogicalBackDestination(currentScreen, context);

    switch (destination) {
      case 'EXIT_APP':
        return false; // Let the calling component handle app exit
        
      case 'DEFAULT':
        navigation.goBack();
        return true;
        
      case 'Signup':
        if (currentScreen === 'TermsAndConditions') {
          navigation.navigate('Signup', {
            termsAccepted: false,
            formData: customParams?.formData
          });
          return true;
        }
        navigation.navigate('Signup');
        return true;
        
      default:
        navigation.navigate(destination, customParams);
        return true;
    }
  }

  /**
   * Create navigation context for a screen
   */
  static createContext(
    currentScreen: string,
    previousScreen?: string,
    additionalData?: Partial<NavigationContext>
  ): NavigationContext {
    return {
      currentScreen,
      previousScreen,
      ...additionalData
    };
  }
}